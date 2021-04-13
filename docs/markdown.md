# 마크다운 문서작성법

## 약어
```
The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium
```
_출력_ :

 The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

## 각주 Footnote

```
Lorem ipsum[^1] dolor sit amet, consectetur adipiscing elit.[^2]

[^1]: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
[^2]:
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.
```

Lorem ipsum[^1] dolor sit amet, consectetur adipiscing elit.[^2]

[^1]: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
[^2]:
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

## Admonition

```
!!! note "Phasellus posuere in sem ut cursus"
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.
```
### with title
_출력_ :

!!! note "Phasellus posuere in sem ut cursus"
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

### without title
```
!!! note ""
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.
```

_출력_ :
!!! note ""
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

## Details
collapsible Admonition

### close rendering
```
??? note
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.
```
_출력_ :
??? note
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

### open rendering

??? 뒤에 + 추가하면 페이지 로드시 블록이 열린 상태로 렌더링됩니다.

```
???+ note
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.
```
_출력_:

???+ note
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.


## SuperFences
nesting of code and content blocks inside admonitions
```
!!! note
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

    ``` python
    def bubble_sort(items):
        for i in range(len(items)):
            for j in range(len(items) - 1 - i):
                if items[j] > items[j + 1]:
                    items[j], items[j + 1] = items[j + 1], items[j]
    ```

    Nunc eu odio eleifend, blandit leo a, volutpat sapien. Phasellus posuere in
    sem ut cursus. Nullam sit amet tincidunt ipsum, sit amet elementum turpis.
    Etiam ipsum quam, mattis in purus vitae, lacinia fermentum enim.
```
_출력_ :
!!! note
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

    ``` python
    def bubble_sort(items):
        for i in range(len(items)):
            for j in range(len(items) - 1 - i):
                if items[j] > items[j + 1]:
                    items[j], items[j + 1] = items[j + 1], items[j]
    ```

    Nunc eu odio eleifend, blandit leo a, volutpat sapien. Phasellus posuere in
    sem ut cursus. Nullam sit amet tincidunt ipsum, sit amet elementum turpis.
    Etiam ipsum quam, mattis in purus vitae, lacinia fermentum enim.

## Admonitions 좌우 정렬
`inline + end` : 우측정렬   / `inline` : 좌측정렬

__Important__: `inline` 표시자를 사용하는 Admonitions는 반드시 옆에 배치하려는 콘텐츠 블록 앞에 선언되어야합니다.
그리고 모바일 뷰포트에서 Admonitions을 렌더링하기에 공간이 부족할 경우 뷰포트의 전체 너비로 늘어납니다.

### 우측정렬 Admonitions
!!! info inline end
    Lorem ipsum dolor sit amet, consectetur
    adipiscing elit. Nulla et euismod nulla.
    Curabitur feugiat, tortor non consequat
    finibus, justo purus auctor massa, nec
    semper lorem quam in massa.
```
!!! info inline end
    Lorem ipsum dolor sit amet, consectetur
    adipiscing elit. Nulla et euismod nulla.
    Curabitur feugiat, tortor non consequat
    finibus, justo purus auctor massa, nec
    semper lorem quam in massa.
```    

`inline + end` : 우측정렬 Admonitions


### 좌측정렬 Admonitions
!!! info inline
    Lorem ipsum dolor sit amet, consectetur
    adipiscing elit. Nulla et euismod nulla.
    Curabitur feugiat, tortor non consequat
    finibus, justo purus auctor massa, nec
    semper lorem quam in massa.
```
!!! info inline
    Lorem ipsum dolor sit amet, consectetur
    adipiscing elit. Nulla et euismod nulla.
    Curabitur feugiat, tortor non consequat
    finibus, justo purus auctor massa, nec
    semper lorem quam in massa.
```

`inline` : 좌측정렬 Admonitions

<br>

## Admonitions 종류


`note`{ #note }, `seealso`

:   !!! note

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`abstract`{ #abstract }, `summary`, `tldr`

:   !!! abstract

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`info`{ #info }, `todo`

:   !!! info

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`tip`{ #tip }, `hint`, `important`

:   !!! tip

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`success`{ #success }, `check`, `done`

:   !!! success

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`question`{ #question }, `help`, `faq`

:   !!! question

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`warning`{ #warning }, `caution`, `attention`

:   !!! warning

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`failure`{ #failure }, `fail`, `missing`

:   !!! failure

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`danger`{ #danger }, `error`

:   !!! danger

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`bug`{ #bug }

:   !!! bug

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`example`{ #example }

:   !!! example

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

`quote`{ #quote }, `cite`

:   !!! quote

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
        euismod nulla. Curabitur feugiat, tortor non consequat finibus, justo
        purus auctor massa, nec semper lorem quam in massa.

## 버튼

### 버튼1 - 기본버튼
```
[Subscribe to our mailing list](#){ .md-button }
```
_출력_ :

[Subscribe to our mailing list](#){ .md-button }

### 버튼2 - primary 버튼

```
[Subscribe to our mailing list](#){ .md-button .md-button--primary }
```

_출력_ :

[Subscribe to our mailing list](#){ .md-button .md-button--primary }

### 버튼3 - 아이콘 버튼
```
[Submit :fontawesome-solid-paper-plane:](#){ .md-button .md-button--primary }
```

_출력_ :

[Submit :fontawesome-solid-paper-plane:](#){ .md-button .md-button--primary }

## 컨텐츠 탭

### Grouping code blocks
```
=== "C"

    ``` c
    #include <stdio.h>

    int main(void) {
      printf("Hello world!\n");
      return 0;
    }
    ```

=== "C++"

    ``` c++
    #include <iostream>

    int main(void) {
      std::cout << "Hello world!" << std::endl;
      return 0;
    }
    ```
```

_출력_ :
=== "C"

    ``` c
    #include <stdio.h>

    int main(void) {
      printf("Hello world!\n");
      return 0;
    }
    ```

=== "C++"

    ``` c++
    #include <iostream>

    int main(void) {
      std::cout << "Hello world!" << std::endl;
      return 0;
    }
    ```

###Grouping other content
```
=== "Unordered list"

    * Sed sagittis eleifend rutrum
    * Donec vitae suscipit est
    * Nulla tempor lobortis orci

=== "Ordered list"

    1. Sed sagittis eleifend rutrum
    2. Donec vitae suscipit est
    3. Nulla tempor lobortis orci
```
_출력_ :

=== "Unordered list"

    * Sed sagittis eleifend rutrum
    * Donec vitae suscipit est
    * Nulla tempor lobortis orci

=== "Ordered list"

    1. Sed sagittis eleifend rutrum
    2. Donec vitae suscipit est
    3. Nulla tempor lobortis orci

## 테이블

### 기본 테이블
```
| Method      | Description                          |
| ----------- | ------------------------------------ |
| `GET`       | :material-check:     Fetch resource  |
| `PUT`       | :material-check-all: Update resource |
| `DELETE`    | :material-close:     Delete resource |
```
_출력_ :

| Method      | Description                          |
| ----------- | ------------------------------------ |
| `GET`       | :material-check:     Fetch resource  |
| `PUT`       | :material-check-all: Update resource |
| `DELETE`    | :material-close:     Delete resource |

### 테이블 정렬
```
=== "Left"

    _Example_:

    ``` markdown hl_lines="2"
    | Method      | Description                          |
    | :---------- | :----------------------------------- |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |
    ```

    _Result_:

    | Method      | Description                          |
    | :---------- | :----------------------------------- |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |

=== "Center"

    _Example_:

    ``` markdown hl_lines="2"
    | Method      | Description                          |
    | :---------: | :----------------------------------: |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |
    ```

    _Result_:

    | Method      | Description                          |
    | :---------: | :----------------------------------: |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |

=== "Right"

    _Example_:

    ``` markdown hl_lines="2"
    | Method      | Description                          |
    | ----------: | -----------------------------------: |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |
    ```

    _Result_:

    | Method      | Description                          |
    | ----------: | -----------------------------------: |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |
```

_출력_ :
=== "Left"

    _Example_:

    ``` markdown hl_lines="2"
    | Method      | Description                          |
    | :---------- | :----------------------------------- |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |
    ```

    _Result_:

    | Method      | Description                          |
    | :---------- | :----------------------------------- |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |

=== "Center"

    _Example_:

    ``` markdown hl_lines="2"
    | Method      | Description                          |
    | :---------: | :----------------------------------: |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |
    ```

    _Result_:

    | Method      | Description                          |
    | :---------: | :----------------------------------: |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |

=== "Right"

    _Example_:

    ``` markdown hl_lines="2"
    | Method      | Description                          |
    | ----------: | -----------------------------------: |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |
    ```

    _Result_:

    | Method      | Description                          |
    | ----------: | -----------------------------------: |
    | `GET`       | :material-check:     Fetch resource  |
    | `PUT`       | :material-check-all: Update resource |
    | `DELETE`    | :material-close:     Delete resource |


## Formatting

### 편집부호
```
Text can be {--deleted--} and replacement text ​{++added++}. This can also be
combined into ​{~~one~> a single~~} operation. ​{==Highlighting==} is also
possible {>>and comments can be added inline<<}.

​{==
Formatting can also be applied to blocks, by putting the opening and closing
tags on separate lines and adding new lines between the tags and the content.
==}

- ==This was marked==
- ^^This was inserted^^
- ~~This was deleted~~
```
_출력_ :

Text can be {--deleted--} and replacement text ​{++added++}. This can also be
combined into ​{~~one~> a single~~} operation. ​{==Highlighting==} is also
possible {>>and comments can be added inline<<}.

​{==
Formatting can also be applied to blocks, by putting the opening and closing
tags on separate lines and adding new lines between the tags and the content.
==}

- ==This was marked==
- ^^This was inserted^^
- ~~This was deleted~~

### 글자체
```
- H~2~0
- A^T^A
- __BOLD__
```

_출력_ :

- H~2~0
- A^T^A
- __BOLD__


### 구분선

```
---
```

_출력_ : 

---

### 타이틀

```
# headline-title1
## headline-title2
### headline-title3
```

## 리스트

### unordered lists
```
- Nulla et rhoncus turpis. Mauris ultricies elementum leo. Duis efficitur
  accumsan nibh eu mattis. Vivamus tempus velit eros, porttitor placerat nibh
  lacinia sed. Aenean in finibus diam.

    * Duis mollis est eget nibh volutpat, fermentum aliquet dui mollis.
    * Nam vulputate tincidunt fringilla.
    * Nullam dignissim ultrices urna non auctor.
```
_출력_ : 

- Nulla et rhoncus turpis. Mauris ultricies elementum leo. Duis efficitur
  accumsan nibh eu mattis. Vivamus tempus velit eros, porttitor placerat nibh
  lacinia sed. Aenean in finibus diam.

    * Duis mollis est eget nibh volutpat, fermentum aliquet dui mollis.
    * Nam vulputate tincidunt fringilla.
    * Nullam dignissim ultrices urna non auctor.

### ordered lists
```
1. Vivamus id mi enim. Integer id turpis sapien. Ut condimentum lobortis
  sagittis. Aliquam purus tellus, faucibus eget urna at, iaculis venenatis
  nulla. Vivamus a pharetra leo.

    1. Vivamus venenatis porttitor tortor sit amet rutrum. Pellentesque aliquet
      quam enim, eu volutpat urna rutrum a. Nam vehicula nunc mauris, a
      ultricies libero efficitur sed.

    2. Morbi eget dapibus felis. Vivamus venenatis porttitor tortor sit amet
      rutrum. Pellentesque aliquet quam enim, eu volutpat urna rutrum a.

        1. Mauris dictum mi lacus
        2. Ut sit amet placerat ante
        3. Suspendisse ac eros arcu
```
_출력_ : 

1. Vivamus id mi enim. Integer id turpis sapien. Ut condimentum lobortis
  sagittis. Aliquam purus tellus, faucibus eget urna at, iaculis venenatis
  nulla. Vivamus a pharetra leo.

    1. Vivamus venenatis porttitor tortor sit amet rutrum. Pellentesque aliquet
      quam enim, eu volutpat urna rutrum a. Nam vehicula nunc mauris, a
      ultricies libero efficitur sed.

    2. Morbi eget dapibus felis. Vivamus venenatis porttitor tortor sit amet
      rutrum. Pellentesque aliquet quam enim, eu volutpat urna rutrum a.

        1. Mauris dictum mi lacus
        2. Ut sit amet placerat ante
        3. Suspendisse ac eros arcu

### definition lists
```
`Lorem ipsum dolor sit amet`
:   Sed sagittis eleifend rutrum. Donec vitae suscipit est. Nullam tempus
    tellus non sem sollicitudin, quis rutrum leo facilisis.

`Cras arcu libero`
:   Aliquam metus eros, pretium sed nulla venenatis, faucibus auctor ex. Proin
    ut eros sed sapien ullamcorper consequat. Nunc ligula ante.

    Duis mollis est eget nibh volutpat, fermentum aliquet dui mollis.
    Nam vulputate tincidunt fringilla.
    Nullam dignissim ultrices urna non auctor.
```
_출력_ : 
`Lorem ipsum dolor sit amet`
:   Sed sagittis eleifend rutrum. Donec vitae suscipit est. Nullam tempus
    tellus non sem sollicitudin, quis rutrum leo facilisis.

`Cras arcu libero`
:   Aliquam metus eros, pretium sed nulla venenatis, faucibus auctor ex. Proin
    ut eros sed sapien ullamcorper consequat. Nunc ligula ante.

    Duis mollis est eget nibh volutpat, fermentum aliquet dui mollis.
    Nam vulputate tincidunt fringilla.
    Nullam dignissim ultrices urna non auctor.

### tasklists
```
- [x] Lorem ipsum dolor sit amet, consectetur adipiscing elit
- [ ] Vestibulum convallis sit amet nisi a tincidunt
    * [x] In hac habitasse platea dictumst
    * [x] In scelerisque nibh non dolor mollis congue sed et metus
    * [ ] Praesent sed risus massa
- [ ] Aenean pretium efficitur erat, donec pharetra, ligula non scelerisque
```

_출력_ : 

- [x] Lorem ipsum dolor sit amet, consectetur adipiscing elit
- [ ] Vestibulum convallis sit amet nisi a tincidunt
    * [x] In hac habitasse platea dictumst
    * [x] In scelerisque nibh non dolor mollis congue sed et metus
    * [ ] Praesent sed risus massa
- [ ] Aenean pretium efficitur erat, donec pharetra, ligula non scelerisque

## 이미지

### Image alignment

When the [Attribute List][3] extension is enabled, images can be aligned by
adding the respective alignment directions via the `align` attribute, i.e.
`align=left` or `align=right`

=== "Left"

    _Example_:

    ``` markdown
    ![Placeholder](https://dummyimage.com/600x400/f5f5f5/aaaaaa&text=–%20Image%20–){ align=left width=300 }
    ```

    _Result_:

    ![Placeholder](https://dummyimage.com/600x400/f5f5f5/aaaaaa&text=–%20Image%20–){ align=left width=300 }

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

=== "Right"

    _Example_:

    ``` markdown
    ![Placeholder](https://dummyimage.com/600x400/f5f5f5/aaaaaa&text=–%20Image%20–){ align=right width=300 }
    ```

    _Result_:

    ![Placeholder](https://dummyimage.com/600x400/f5f5f5/aaaaaa&text=–%20Image%20–){ align=right width=300 }

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

모바일 뷰포트에서는 이미지 옆에 텍스트를 렌더링 할 공간이 충분하지 않으면 이미지가 뷰포트의 전체 너비로 늘어납니다. 

### Image captions
```
<figure>
  <img src="https://dummyimage.com/600x400/eee/aaa" width="300" />
  <figcaption>Image caption</figcaption>
</figure>
```
<figure>
  <img src="https://dummyimage.com/600x400/eee/aaa" width="300" />
  <figcaption>Image caption</figcaption>
</figure>

### Image 내부 경로
```
![Placeholder](img/ocean-view-1.jpg){width=300}
```
![Placeholder](img/ocean-view-1.jpg){width=300}

```
<figure>
  <img src="../img/ocean-view-1.jpg" width="300" />
  <figcaption>Image caption</figcaption>
</figure>
```

<figure>
  <img src="../img/ocean-view-1.jpg" width="300" />
  <figcaption>Image caption</figcaption>
</figure>

## Tibetan

__DDC_Uchen__ 폰트로 티벳어를 렌더링하기 위해 티벳어 문장 앞과 뒤로 `_티벳어문장_` 언더바(underbar)를 추가한다.
```
_སློབ་ཚན་དང་པོ།
༼ ཡི་གེ་དབྱངས་གསལ་བཤད་པ།༽
ལེགས་བཤད་ལྗོན་དབང་ལས།
དབྱངས་ཀྱི་བྱ་བ་གསལ་པོ་རུ།
བྱེད་པ་ཨི་ཨུ་ཨེ་ཨོ་བཞི།
གསལ་བྱེད་ཀ་སོགས་སུམ་ཅུ་ཡིན།_
```

_출력_ : 

_སློབ་ཚན་དང་པོ།
༼ ཡི་གེ་དབྱངས་གསལ་བཤད་པ།༽
ལེགས་བཤད་ལྗོན་དབང་ལས།
དབྱངས་ཀྱི་བྱ་བ་གསལ་པོ་རུ།
བྱེད་པ་ཨི་ཨུ་ཨེ་ཨོ་བཞི།
གསལ་བྱེད་ཀ་སོགས་སུམ་ཅུ་ཡིན།_