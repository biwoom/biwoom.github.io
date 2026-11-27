---
mainTopics:
  grief: 상실과 위로
  kindness: 관계와 자비
  presence: 마음과 알아차림
  practice: 일상과 수행
recommendedStories: [mustard, lake]
---

# 이야기카드 설정

`mainTopics`의 키를 각 원고의 `topic`에 사용합니다. 목록에 적힌 순서로 ‘주제별’ 화면의 메인 주제가 표시됩니다.

‘오늘의 이야기’에는 공개 원고에 연결된 `html/` 카드 중 `data-card-date`가 가장 최근인 카드가 자동으로 표시됩니다. 카드 날짜가 같거나 연결된 카드가 없으면 원고 공개일(`publishedAt`)이 최근인 순, `order`가 앞선 순으로 고릅니다.

`recommendedStories`에는 ‘추천 이야기’로 보여 줄 공개 원고의 `id` 두 개를 표시 순서대로 적습니다. HTML 카드가 연결된 원고는 해당 카드로 표시합니다.

HTML 카드는 이 폴더의 `html/` 바로 아래에 한 파일씩 둡니다. 표시할 카드에 원고와 같은 `data-article-id`와 카드 날짜 `data-card-date="YYYY-MM-DD"`를 적습니다. 추천 중인 원고를 비공개로 바꿀 때는 먼저 추천 설정을 수정합니다. 연결이 올바른지는 저장소 루트에서 `npm run check:content`로 확인합니다.
