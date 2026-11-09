# BORIDO HTTPS 발급 장애 재조사

버전: 1.0 · 작성일: 2026-11-08 · 대상: BORIDO / OL 코어

서비스: https://borido.org/ · 저장소: `biwoom/biwoom.github.io`

이번 실측: 2026-11-08 21:59–22:03 KST. 아래 GitHub health 값은 22:00:56 KST의 완료된 HTTP 200 응답이다. 22:01:45 재요청은 HTTP 202/빈 객체였으며, 22:03:39에 다시 완료된 응답에서 apex의 같은 실패 상태를 확인했다. HTTP 202는 성공이 아닌 검사 대기로 해석한다. 설정을 바꾸지 않고 조회했으며 과거 관측과 이번 측정을 구분한다.

현재 확인되는 병목은 GitHub의 도메인 검사 결과가 외부 DNS 및 HTTP 응답과 일치하지 않는다는 점이다. GitHub는 여전히 비-Pages IP가 있다고 보고 HTTPS 발급 대상에서 제외하며, 인증서는 `new` 상태다. 기존 DNS 또는 검사 결과의 캐시가 가장 유력한 설명이지만, GitHub 내부의 실제 조회 IP·검사 시각·인증서 작업 로그가 없어 확정할 수 없다.

## 이번에 확인한 사실

| 검사 | 결과 | 의미 |
| --- | --- | --- |
| Pages 설정 | `build_type: workflow`, `cname: borido.org` | 커스텀 도메인 매핑이 설정에 남아 있다. |
| 배포 | 커밋 `50fd351`의 Actions 및 Pages 배포 성공, 21:22:19 KST | 빌드/배포 실패로 인한 장애라는 근거가 없다. |
| 상위 `.org` 위임 | `ns1.iwinv.kr`, `ns2.iwinv.kr` | 등록기관에 지정된 DNS 운영 주체는 iwinv다. |
| 권한 DNS 서버 | ns1 `115.68.233.20`, ns2 `115.68.100.115` | 두 서버에 IP로 직접 UDP/TCP 질의했다. |
| apex A | 양쪽 모두 `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` | 공식 Pages IPv4 주소 네 개가 일치한다. |
| SOA | 양쪽 serial `2026110805` | 이번 측정에서는 두 서버의 존 버전과 검사한 레코드가 일치한다. |
| 공개 재귀 DNS | 1.1.1.1, 8.8.8.8, 9.9.9.9 모두 올바른 A | 조사한 경로에서 과거 IP를 재현하지 못했다. 전 세계 모든 캐시를 확인한 것은 아니다. |
| 별도 DoH 조회 | Google/Cloudflare에서도 올바른 A | 로컬 시스템 DNS 결과만으로 판단하지 않았다. |
| `www` | CNAME `biwoom.github.io` | 최종 A/AAAA도 공식 Pages 주소다. |
| apex AAAA/CNAME | 없음, NOERROR/NODATA | 충돌하는 IPv6 주소나 apex CNAME을 발견하지 못했다. IPv6 레코드가 필수는 아니다. |
| CAA | apex 및 `.org`에 제한 없음, www의 CNAME 대상은 Let's Encrypt 허용 | 이번 조회에서는 CAA 제한 또는 CAA 질의 실패가 없다. |
| DNSSEC | `.org`의 borido.org DS 없음 | 오래된 DS로 인한 검증 실패라는 근거가 없다. |
| HTTP | 네 Pages IPv4에 Host를 고정해도 apex 200, www 301 → apex; `Server: GitHub.com` | 실제 도메인 라우팅이 작동한다. |
| TLS | 두 호스트 모두 네 IPv4에서 `*.github.io` 인증서 반환 | SAN에 borido.org/www.borido.org가 없으므로 호스트명 검증에 실패한다. |
| 인증서 API | `state: new`, `https_enforced: false` | API 설명상 요청 시작 대기 상태다. CA가 이미 발급 중이라는 증거는 아니다. |
| apex NS | 두 권한 서버가 UDP/TCP 모두 NOERROR, ANSWER 0, SOA 반환 | 상위 위임과 별개로 존 자체의 NS 레코드가 응답되지 않는 이상이 남아 있다. |

GitHub health 핵심 응답:

```json
{
  "host": "borido.org",
  "nameservers": "default",
  "is_pointed_to_github_pages_ip": false,
  "is_non_github_pages_ip_present": true,
  "is_served_by_pages": false,
  "is_https_eligible": false,
  "caa_error": null
}
```

오류 이름은 `NotServedByPagesError`다. 22:00:56 KST 응답의 GitHub 요청 ID는 `FB19:883FB:C91C10:15DDF24:6AF07287`이며, HTTP 캐시 헤더는 `max-age=60`이다. `Cache-Control: no-cache`를 붙여 다시 조회해도 같은 내용이 나왔지만, 이것이 GitHub 내부 DNS/작업 캐시까지 비웠다는 뜻은 아니다.

22:03:39 KST의 완료된 재검사에서는 apex의 실패가 유지되었고, `www`도 CNAME이 아닌 비-Pages A로 판단하는 `InvalidARecordError`로 바뀌었다(요청 ID `FDEB:2A86D1:CB53E9:1604FCF:6AF0732B`). 22:03:59에 두 권한 서버와 Google DNS를 다시 조회했지만 모두 `www CNAME biwoom.github.io`를 반환했다. 이 추가 불일치 역시 GitHub 검사 경로/캐시/결과를 확인할 필요를 보여주며, 현재 www 레코드가 잘못되었다는 증거로 취급하지 않는다.

## 시간 순서에 따른 원인 구분

1. 초기 도메인 전환 작업 기록에는 apex A가 `115.68.216.239`로 조회된 사실이 있다. Pages 주소가 아니므로 해당 응답을 사용하는 검증기는 정상 발급 조건을 만족하지 못한다. 기록만으로 최초 오설정의 시작·종료 시각이나 GitHub의 실제 조회 IP까지 알 수는 없다.
2. 이후 앞선 조사에서 양쪽 iwinv 서버의 A가 Pages 주소로 바뀐 상태에서도 인증서 대기가 이어졌다. 따라서 ns1 미반영 하나로 전체 지연을 설명할 수 없다.
3. DNS 변경 과정 중 ns1의 `REFUSED`, ns2의 A `NODATA`가 일시적으로 관측되었다. 당시에는 추가 장애 요인이었지만 사용자의 실제 삭제/재등록 작업 내역이나 iwinv 내부 배포 로그를 확인한 것은 아니다.
4. 이번 조사에서는 두 서버의 A/CNAME 응답과 HTTP 연결이 정상이다. 하지만 apex NS 누락 응답이 계속되고, GitHub의 완료된 검사 결과는 비-Pages IP가 있다고 보고한다.

현재 A/CNAME TTL과 SOA의 음성 캐시 기준은 `86400초`다. DNS 레코드가 없다는 NODATA 응답도 캐시될 수 있어 수정 후에도 조회 위치에 따라 결과가 다를 수 있다. 실제 재귀 서버별 상한은 다르며 이번 Google/Quad9 응답에서도 더 짧은 TTL이 관측되었다. 현재 TTL만으로 과거 A의 TTL, GitHub 캐시 잔여 시간 또는 정확한 복구 시각을 계산할 수는 없다. [RFC 2308](https://www.rfc-editor.org/rfc/rfc2308.html#section-5)

## 가장 유력한 설명과 한계

현재 외부 DNS는 정상 A를 반환하지만 GitHub는 비-Pages IP를 감지한다. 이 차이와 초기 비-Pages A 기록을 함께 보면 **이전 DNS 응답 또는 이전 검사 결과가 GitHub 쪽에 남은 상황**이 가장 유력하다. 특정 지역에서 다른 응답을 받는 경우나 검사 서비스 자체의 문제도 배제할 수 없다. 공개 API는 실제 감지 IP와 검사 완료 시각을 제공하지 않으므로 이들 가능성을 확정적으로 구분하지 못한다.

GitHub 공식 절차는 도메인 저장 → DNS 검사 → 성공 시 인증서 요청 작업 등록 → 발급된 인증서 배포다. 현재 결과는 DNS 검사 단계에 문제가 남아 있음을 보여준다. [GitHub HTTPS 발급 절차](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https#troubleshooting-certificate-provisioning-certificate-not-yet-created-error)

공개된 `github/pages-health-check` 구현도 비-Pages 주소가 있으면 HTTPS 적격성을 거부하며, 서버 응답 헤더로 Pages 서비스 여부를 확인한다. NS가 없다는 사실만으로 비-Pages IP 존재를 판정하는 코드는 아니다. 다만 이 공개 코드가 현재 운영 서버와 정확히 같은 버전인지는 확인하지 못했다. [검사 구현](https://github.com/github/pages-health-check/blob/master/lib/github-pages-health-check/domain.rb#L507), [기본/공개/권한 DNS 조회 구분](https://github.com/github/pages-health-check/blob/master/lib/github-pages-health-check/resolver.rb)

apex NS 누락 응답은 별도로 확인된 DNS 구성 이상이다. DNS 표준은 존 원점에 SOA와 NS를 요구한다. 상위 `.org`의 위임이 있어 현재 A 조회가 된다고 해서 존 자체의 NS 응답 문제가 해소되는 것은 아니다. 다만 이번 인증서 대기의 직접 원인인지는 증명되지 않았다. **ns1만의 반영 지연이라는 진단도 현재 상태와 맞지 않는다.** [RFC 2181 §6.1](https://www.rfc-editor.org/rfc/rfc2181.html#section-6.1)

현재 GitHub Pages와 Let's Encrypt 운영 API는 정상으로 표시되었다. GitHub는 11월 8일 일부 비인증 API 요청 지연을 12:32 UTC에 해결했다고 공지했고, Let's Encrypt는 11월 6일 IPv6 문제의 조치 및 운영 API 정상 상태를 안내한다. 이 공지만으로 borido.org의 지연을 해당 장애에 연결할 근거는 없다. [GitHub 상태](https://www.githubstatus.com/), [Let's Encrypt 상태](https://letsencrypt.status.io/)

발급 제한(rate limit), ACME 검증 실패 상세, GitHub 내부 작업 대기열은 열람할 수 없었다. 인증서 투명성 검색(crt.sh)은 시간 초과로 완료하지 못했으므로 발급 이력의 존재/부재에 대한 근거로 사용하지 않았다.

## CNAME 파일을 워크플로에서 생성하자는 제안

이 제안은 **Actions를 사용한다는 사실만으로는 적용 여부를 판단할 수 없다.** 최종 Pages 게시 방식이 핵심이다.

| 최종 게시 방식 | CNAME 파일의 역할 | `dist/CNAME` 생성 제안 |
| --- | --- | --- |
| 브랜치에서 게시, Actions가 빌드 결과를 그 브랜치에 푸시 | 게시 소스 루트의 CNAME을 유지해야 한다. UI에서 도메인을 저장하면 해당 파일을 생성할 수 있다. | 배포 브랜치를 덮어쓸 때 파일을 보존하는 방법이 될 수 있다. |
| 커스텀 Actions에서 artifact 업로드 후 `deploy-pages`로 게시 | Pages 설정이 도메인을 관리하며 CNAME 파일은 생성되지 않고 기존 파일도 무시된다. | 도메인 매핑 보존이나 인증서 발급 문제를 해결하는 효과가 없다. |

보리도의 `.github/workflows/deploy.yml`은 `actions/upload-pages-artifact@v3`로 `dist`를 올리고 `actions/deploy-pages@v4`로 게시한다. 배포 브랜치에 빌드 결과를 커밋/강제 푸시하는 단계가 없다. API도 `build_type: workflow`, `cname: borido.org`를 유지한다. 따라서 “배포가 CNAME을 지워 도메인 매핑이 사라졌다”는 설명은 현재 증거와 맞지 않는다. 제안된 `echo ... > ./dist/CNAME` 단계는 추가하지 않았다. [GitHub의 명시적 설명](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)

CAA 레코드가 아예 없는 것도 발급 차단 사유가 아니다. 설정한 제한이 있는 경우에만 발급 기관 허용 여부를 확인하며, 빈 응답과 DNS 오류는 구분해야 한다. [Let's Encrypt CAA 안내](https://letsencrypt.org/docs/caa/)

## 다음 확인 사항

현재 정상 A/CNAME을 유지하면서 iwinv에 존 원점 NS 응답을 점검하도록 요청하는 것이 구체적인 DNS 조치다. 동시에 GitHub에 외부 DNS와 health 결과의 불일치를 전달하면 내부 조회 IP/캐시/발급 작업 상태를 확인할 수 있다. 아래 문구는 문의 초안이며 실제 발송하지 않았다.

**iwinv 문의 초안**

> borido.org의 상위 .org 위임은 ns1.iwinv.kr/ns2.iwinv.kr입니다. 2026-11-08 22:00 KST 기준 두 서버(115.68.233.20, 115.68.100.115)가 A는 정상 반환하지만, `borido.org NS` 질의에는 UDP/TCP 모두 AA=1, NOERROR, ANSWER=0과 SOA만 반환합니다. SOA serial은 2026110805입니다. 존 원점의 NS RRset이 정상 제공되지 않는 이유와 양쪽 서버의 존 구성을 점검해 주세요. 설정 변경 중 REFUSED/A NODATA도 관측되었으므로 당시 배포 상태도 확인 부탁드립니다.

**GitHub 문의 초안**

> Repository biwoom/biwoom.github.io uses custom Actions Pages deployment with cname borido.org. Both authoritative servers and sampled Google/Cloudflare/Quad9 resolvers return only 185.199.108.153–185.199.111.153. HTTP requests to each Pages IPv4 address with Host borido.org return 200 and Server: GitHub.com. However, the completed Pages health response at 2026-11-08 13:00:56 UTC reports is_non_github_pages_ip_present=true, is_https_eligible=false and NotServedByPagesError. Request ID: FB19:883FB:C91C10:15DDF24:6AF07287. The certificate remains in state new. Please identify the IP addresses and DNS check timestamp used by the service and inspect stale DNS/health state and certificate provisioning jobs. A separate apex NS response issue has been identified with the DNS provider.

> A subsequent completed check at 13:03:39 UTC also reported www.borido.org as a non-Pages A record (InvalidARecordError), while direct authoritative and Google queries at 13:03:59 UTC still returned CNAME biwoom.github.io. Request ID: FDEB:2A86D1:CB53E9:1604FCF:6AF0732B.

추가 삭제/재등록은 이미 남은 DNS 캐시를 제거하지 못한다. 수정 후 판단할 때는 마지막으로 양쪽 권한 서버의 필요한 응답이 안정된 시점을 기록해야 한다. 현재 TTL 24시간을 참고하되, 그 시간이 지나면 반드시 발급된다고 보장할 수 없다. DNS 검사와 인증서 상태가 계속 불일치하면 같은 설정을 반복하기보다 위 증거를 이용해 제공업체 내부 상태를 확인해야 한다.

## 재현 명령과 검증 범위

```sh
dig @ns1.iwinv.kr borido.org A +norecurse
dig @ns2.iwinv.kr borido.org A +norecurse
dig @ns1.iwinv.kr borido.org NS +norecurse +tcp
dig @ns2.iwinv.kr borido.org NS +norecurse +tcp
dig @v0n0.pir-ns.org borido.org NS +norecurse
dig @v0n0.pir-ns.org borido.org DS +norecurse
dig @8.8.8.8 borido.org A
dig @1.1.1.1 borido.org CAA
gh api repos/biwoom/biwoom.github.io/pages
gh api -i repos/biwoom/biwoom.github.io/pages/health
curl -I --resolve borido.org:80:185.199.108.153 http://borido.org/
curl -I --resolve borido.org:443:185.199.108.153 https://borido.org/
```

HTTP/TLS 실측은 조사 환경에서 연결된 경로에 한정된다. API health의 HTTP 202/빈 객체는 비동기 검사 대기이므로 나중에 완료된 응답을 확인해야 한다. 임시 원시 결과는 `/tmp/borido-https-20261108/`에 보관했으며 영구 기록은 이 문서다. 이번 작업은 내부 진단 문서만 변경했으므로 로컬 빌드를 반복하지 않았다. 실제 배포 성공은 [Actions 실행](https://github.com/biwoom/biwoom.github.io/actions/runs/42479854372)과 deployment status API에서 확인했다.

## 수정 변경사항

### 2026-11-08

- 최초 기록부터 DNS 변경 중 장애와 현재 상태를 분리해 재조사했다.
- 실제 DNS/HTTP와 GitHub health 사이의 불일치, apex NS 누락, 확인 한계를 기록했다.
- artifact 방식에서는 CNAME 생성 제안이 해결책이 되지 않음을 공식 문서 및 현재 워크플로와 대조했다.
