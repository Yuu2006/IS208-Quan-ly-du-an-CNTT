| MÃ£ UC | TÃªn Use case | MÃ´ táº£ Use case |
| :---: | ----- | ----- |
| **GÃ“I 1: Quáº£n lÃ½ tÃ i khoáº£n** |  |  |
| **UC01** | Quáº£n lÃ½ tÃ i khoáº£n | GÃ³i chá»©c nÄƒng tá»•ng há»£p cho phÃ©p quáº£n trá»‹ viÃªn thÃªm tÃ i khoáº£n, PhÃ¢n quyá»n ngÆ°á»i dÃ¹ng, khÃ³a/ vÃ´ hiá»‡u hÃ³a tÃ i khoáº£n |
| **UC02** | ÄÄƒng nháº­p | Cho phÃ©p ngÆ°á»i dÃ¹ng xÃ¡c thá»±c thÃ´ng tin tÃ i khoáº£n há»£p lá»‡ Ä‘á»ƒ truy cáº­p vÃ o há»‡ thá»‘ng. |
| **UC03** | ÄÄƒng xuáº¥t | ThoÃ¡t tÃ i khoáº£n ngÆ°á»i dÃ¹ng khá»i há»‡ thá»‘ng. |
| **UC04** | ThÃªm tÃ i khoáº£n | Quáº£n trá»‹ viÃªn táº¡o má»›i tÃ i khoáº£n cho nhÃ¢n viÃªn, nÃ´ng tráº¡i, Ä‘Æ¡n vá»‹ váº­n chuyá»ƒn hoáº·c cá»­a hÃ ng tham gia chuá»—i cung á»©ng. |
| **UC05** | Cáº­p nháº­t thÃ´ng tin tÃ i khoáº£n | NgÆ°á»i dÃ¹ng cáº­p nháº­t láº¡i cÃ¡c thÃ´ng tin cÃ¡ nhÃ¢n, liÃªn há»‡ cá»§a tÃ i khoáº£n hiá»‡n táº¡i. |
| **UC06** | PhÃ¢n quyá»n ngÆ°á»i dÃ¹ng | Quáº£n trá»‹ viÃªn phÃ¢n quyá»n truy cáº­p cho cÃ¡c tÃ i khoáº£n ngÆ°á»i dÃ¹ng khÃ¡c |
| **UC07** | KhÃ³a/ VÃ´ hiá»‡u hÃ³a tÃ i khoáº£n | Quáº£n trá»‹ viÃªn vÃ´ hiá»‡u hÃ³a tÃ i khoáº£n cá»§a cÃ¡c Ä‘á»‘i tÃ¡c khÃ´ng cÃ²n há»£p tÃ¡c Ä‘á»ƒ Ä‘áº£m báº£o báº£o máº­t. |

![][image1]  
**UC01: QUáº¢N LÃ TÃ€I KHOáº¢N**

| TÃªn Use-case | Quáº£n lÃ½ tÃ i khoáº£n |
| :---: | :---- |
| **ID** | UC01 |
| **Má»©c Ä‘á»™ quan trá»ng** | Cao |
| **TÃ¡c nhÃ¢n chÃ­nh** | Quáº£n trá»‹ viÃªn (Admin) |
| **MÃ´ táº£** | Use case tá»•ng quÃ¡t bao gá»“m toÃ n bá»™ cÃ¡c chá»©c nÄƒng nghiá»‡p vá»¥ liÃªn quan Ä‘áº¿n quáº£n lÃ½ tÃ i khoáº£n trong há»‡ thá»‘ng, Ä‘Ã¢y lÃ  use case bao quÃ¡t, Ä‘iá»u phá»‘i cÃ¡c use case con (UC02 â†’ UC07). |
| **Sá»± kiá»‡n kÃ­ch hoáº¡t** | Admin chá»n â€œQuáº£n lÃ½ tÃ i khoáº£nâ€ tá»« menu quáº£n trá»‹ há»‡ thá»‘ng. |
| **Tiá»n Ä‘iá»u kiá»‡n** | Admin Ä‘Ã£ Ä‘Äƒng nháº­p. TÃ i khoáº£n cÃ³ quyá»n â€œQuáº£n lÃ½ ngÆ°á»i dÃ¹ngâ€. |
| **Háº­u Ä‘iá»u kiá»‡n** | KhÃ´ng thay Ä‘á»•i tráº¡ng thÃ¡i náº¿u chá»‰ xem. Náº¿u cÃ³ thao tÃ¡c, tÃ i khoáº£n tÆ°Æ¡ng á»©ng Ä‘Æ°á»£c cáº­p nháº­t vÃ  ghi Audit Log. |
| **Luá»“ng sá»± kiá»‡n chÃ­nh** | NgÆ°á»i dÃ¹ng truy cáº­p vÃ o mÃ n hÃ¬nh "Quáº£n lÃ½ tÃ i khoáº£n". Há»‡ thá»‘ng hiá»ƒn thá»‹ tá»•ng quan cÃ¡c chá»©c nÄƒng quáº£n lÃ½ lÃ´ hÃ ng theo phÃ¢n quyá»n. Khi chá»n má»™t hÃ nh Ä‘á»™ng, há»‡ thá»‘ng Ä‘iá»u hÆ°á»›ng Ä‘áº¿n mÃ n hÃ¬nh tÆ°Æ¡ng á»©ng: â€œThÃªm má»›iâ€ â†’ thá»±c thi UC04. â€œPhÃ¢n quyá»nâ€ â†’ thá»±c thi UC06. â€œKhÃ³a/Má»Ÿ khÃ³aâ€ â†’ thá»±c thi UC07. |
| **Luá»“ng sá»± kiá»‡n phá»¥** | 3a. Admin chá»n má»™t tÃ i khoáº£n \-\> Há»‡ thá»‘ng hiá»ƒn thá»‹ nÃºt \[Xem chi tiáº¿t\], \[Cáº­p nháº­t thÃ´ng tin\], \[PhÃ¢n quyá»n\], \[KhÃ³a/Má»Ÿ khÃ³a\]. â€œCáº­p nháº­t thÃ´ng tinâ€ â†’ Admin sá»­a trá»±c tiáº¿p cÃ¡c trÆ°á»ng (ngoáº¡i trá»« tÃªn Ä‘Äƒng nháº­p) vÃ  lÆ°u. |
| **Luá»“ng sá»± kiá»‡n lá»—i hoáº·c ngoáº¡i lá»‡** | KhÃ´ng cÃ³. |

![][image2]  
**UC02: ÄÄ‚NG NHáº¬P**

| TÃªn Use-case | ÄÄƒng nháº­p |
| :---: | :---- |
| **ID** | UC02 |
| **Má»©c Ä‘á»™ quan trá»ng** | Cao |
| **TÃ¡c nhÃ¢n chÃ­nh** | NgÆ°á»i dÃ¹ng |
| **MÃ´ táº£** | Cho phÃ©p ngÆ°á»i dÃ¹ng xÃ¡c thá»±c thÃ´ng tin tÃ i khoáº£n há»£p lá»‡ Ä‘á»ƒ truy cáº­p vÃ o há»‡ thá»‘ng. |
| **Sá»± kiá»‡n kÃ­ch hoáº¡t** | NgÆ°á»i dÃ¹ng truy cáº­p vÃ o á»©ng dá»¥ng/trang web vÃ  chá»n tÃ­nh nÄƒng "ÄÄƒng nháº­p", hoáº·c há»‡ thá»‘ng yÃªu cáº§u xÃ¡c thá»±c khi ngÆ°á»i dÃ¹ng cá»‘ gáº¯ng truy cáº­p má»™t trang yÃªu cáº§u quyá»n Ä‘Äƒng nháº­p. |
| **Tiá»n Ä‘iá»u kiá»‡n** | Há»‡ thá»‘ng Ä‘ang hoáº¡t Ä‘á»™ng bÃ¬nh thÆ°á»ng cÃ³ káº¿t ná»‘i vá»›i cÆ¡ sá»Ÿ dá»¯ liá»‡u. NgÆ°á»i dÃ¹ng Ä‘Ã£ Ä‘Æ°á»£c táº¡o tÃ i khoáº£n hoáº·c Ä‘Äƒng kÃ½ tÃ i khoáº£n thÃ nh cÃ´ng trÆ°á»›c Ä‘Ã³. |
| **Háº­u Ä‘iá»u kiá»‡n** | ThÃ nh cÃ´ng: Tráº¡ng thÃ¡i Ä‘Äƒng nháº­p Ä‘Æ°á»£c xÃ¡c nháº­n, há»‡ thá»‘ng chuyá»ƒn hÆ°á»›ng ngÆ°á»i dÃ¹ng vÃ o trang chá»§ tÆ°Æ¡ng á»©ng vá»›i vai trÃ² cá»§a há». Tháº¥t báº¡i: Tráº¡ng thÃ¡i há»‡ thá»‘ng khÃ´ng Ä‘á»•i, khÃ´ng cÃ³ phiÃªn lÃ m viá»‡c nÃ o Ä‘Æ°á»£c táº¡o ra. |
| **Luá»“ng sá»± kiá»‡n chÃ­nh** | Há»‡ thá»‘ng hiá»ƒn thá»‹ form Ä‘Äƒng nháº­p gá»“m Ã´ â€œTÃªn Ä‘Äƒng nháº­pâ€ vÃ  â€œMáº­t kháº©uâ€, nÃºt â€œÄÄƒng nháº­pâ€. NgÆ°á»i dÃ¹ng nháº­p thÃ´ng tin vÃ  nháº¥n â€œÄÄƒng nháº­pâ€. Há»‡ thá»‘ng kiá»ƒm tra: TÃ i khoáº£n tá»“n táº¡i. Máº­t kháº©u khá»›p vá»›i hash lÆ°u trá»¯. TÃ i khoáº£n khÃ´ng bá»‹ khÃ³a. Há»‡ thá»‘ng táº¡o phiÃªn, cáº­p nháº­t thá»i gian Ä‘Äƒng nháº­p cuá»‘i, ghi Audit Log. Äiá»u hÆ°á»›ng vá» mÃ n hÃ¬nh chÃ­nh. |
| **Luá»“ng sá»± kiá»‡n phá»¥** | KhÃ´ng cÃ³. |
| **Luá»“ng sá»± kiá»‡n lá»—i hoáº·c ngoáº¡i lá»‡** | 4a: NgÆ°á»i dÃ¹ng bá» trá»‘ng thÃ´ng tin Ä‘Äƒng nháº­p (TÃªn Ä‘Äƒng nháº­p vÃ  máº­t kháº©u). Há»‡ thá»‘ng cháº·n yÃªu cáº§u ÄÄƒng nháº­p vÃ  xuáº¥t ra thÃ´ng bÃ¡o lÃ´i: â€œThiáº¿u thÃ´ng tinâ€. 4b: NgÆ°á»i dÃ¹ng nháº­p sai thÃ´ng tin Ä‘Äƒng nháº­p. Há»‡ thá»‘ng tá»« chá»‘i truy cáº­p vÃ  xuáº¥t ra thÃ´ng báº£o lá»‘i: â€œThÃ´ng tin Ä‘Äƒng nháº­p khÃ´ng chÃ­nh xÃ¡câ€. 4c: TÃ i khoáº£n ngÆ°á»i dÃ¹ng Ä‘Äƒng nháº­p Ä‘Ã£ bá»‹ vÃ´ hiá»‡u hÃ³a/ bá»‹ khÃ³a. Há»‡ thá»‘ng tá»« chá»‘i truy cáº­p vÃ  hiá»ƒn thá»‹ thÃ´ng bÃ¡o: â€œTÃ i khoáº£n Ä‘Ã£ bá»‹ khÃ³a. Vui lÃ²ng liÃªn há»‡  |

![][image3]  
**UC03: ÄÄ‚NG XUáº¤T**

| TÃªn Use-case | ÄÄƒng xuáº¥t |
| :---: | :---- |
| **ID** | UC03 |
| **Má»©c Ä‘á»™ quan trá»ng** | Cao |
| **TÃ¡c nhÃ¢n chÃ­nh** | NgÆ°á»i dÃ¹ng (Bao gá»“m táº¥t cáº£ cÃ¡c vai trÃ²: Quáº£n trá»‹ viÃªn, NÃ´ng tráº¡i, ÄÆ¡n vá»‹ váº­n chuyá»ƒn, Cá»­a hÃ ng...) |
| **MÃ´ táº£** | ThoÃ¡t tÃ i khoáº£n ngÆ°á»i dÃ¹ng khá»i há»‡ thá»‘ng Ä‘á»ƒ báº£o máº­t thÃ´ng tin vÃ  káº¿t thÃºc phiÃªn lÃ m viá»‡c. |
| **Sá»± kiá»‡n kÃ­ch hoáº¡t** | NgÆ°á»i dÃ¹ng chá»§ Ä‘á»™ng nháº¥n vÃ o nÃºt/liÃªn káº¿t "ÄÄƒng xuáº¥t" (Logout) trÃªn thanh cÃ´ng cá»¥ hoáº·c menu tÃ i khoáº£n cá»§a há»‡ thá»‘ng. |
| **Tiá»n Ä‘iá»u kiá»‡n** | NgÆ°á»i dÃ¹ng hiá»‡n Ä‘ang trong tráº¡ng thÃ¡i Ä‘Ã£ Ä‘Äƒng nháº­p thÃ nh cÃ´ng vÃ o há»‡ thá»‘ng (phiÃªn lÃ m viá»‡c/session hoáº·c token Ä‘ang cÃ³ hiá»‡u lá»±c). |
| **Háº­u Ä‘iá»u kiá»‡n** | Há»‡ thá»‘ng tráº£ vá» tráº¡ng thÃ¡i trÆ°á»›c phiÃªn Ä‘Äƒng nháº­p |
| **Luá»“ng sá»± kiá»‡n chÃ­nh** | NgÆ°á»i dÃ¹ng nháº¥n vÃ o nÃºt/biá»ƒu tÆ°á»£ng "ÄÄƒng xuáº¥t". Há»‡ thá»‘ng hiá»ƒn thá»‹ há»™p thoáº¡i xÃ¡c nháº­n: "Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n Ä‘Äƒng xuáº¥t khÃ´ng?". NgÆ°á»i dÃ¹ng chá»n "Äá»“ng Ã½". Há»‡ thá»‘ng gá»­i yÃªu cáº§u há»§y phiÃªn lÃ m viá»‡c lÃªn mÃ¡y chá»§. MÃ¡y chá»§ vÃ´ hiá»‡u hÃ³a token xÃ¡c thá»±c hoáº·c xÃ³a session tÆ°Æ¡ng á»©ng cá»§a ngÆ°á»i dÃ¹ng. Há»‡ thá»‘ng xÃ³a cÃ¡c dá»¯ liá»‡u xÃ¡c thá»±c lÆ°u táº¡m trÃªn trÃ¬nh duyá»‡t/á»©ng dá»¥ng cá»§a thiáº¿t bá»‹. Há»‡ thá»‘ng chuyá»ƒn hÆ°á»›ng ngÆ°á»i dÃ¹ng vá» mÃ n hÃ¬nh ÄÄƒng nháº­p. Use case káº¿t thÃºc thÃ nh cÃ´ng. |
| **Luá»“ng sá»± kiá»‡n phá»¥** | 2a. Há»§y thao tÃ¡c Ä‘Äƒng xuáº¥t: Há»‡ thá»‘ng há»i xÃ¡c nháº­n Ä‘Äƒng xuáº¥t, NgÆ°á»i dÃ¹ng chá»n â€œHá»§yâ€ \- há»§y xÃ¡c nháº­n. Lá»‡nh Ä‘Äƒng xuáº¥t bá»‹ há»§y vÃ  ngÆ°á»i dÃ¹ng váº«n á»Ÿ láº¡i trang, phiÃªn lÃ m viá»‡c giá»¯ nguyÃªn. Luá»“ng káº¿t thÃºc. |
| **Luá»“ng sá»± kiá»‡n lá»—i** | KhÃ´ng cÃ³. |

![][image4]  
**UC04: THÃŠM TÃ€I KHOáº¢N**

| TÃªn Use-case | ThÃªm tÃ i khoáº£n |
| :---: | :---- |
| **ID** | UC04 |
| **Má»©c Ä‘á»™ quan trá»ng** | Cao |
| **TÃ¡c nhÃ¢n chÃ­nh** | Quáº£n trá»‹ viÃªn |
| **MÃ´ táº£** | Quáº£n trá»‹ viÃªn táº¡o má»›i má»™t tÃ i khoáº£n ngÆ°á»i dÃ¹ng cÃ¹ng vai trÃ² vÃ  thÃ´ng tin liÃªn há»‡, giÃºp Ä‘á»‘i tÃ¡c/nhÃ¢n viÃªn cÃ³ thá»ƒ Ä‘Äƒng nháº­p vÃ o há»‡ thá»‘ng. |
| **Sá»± kiá»‡n kÃ­ch hoáº¡t** | Admin nháº¥n â€œThÃªm tÃ i khoáº£nâ€ tá»« mÃ n hÃ¬nh Quáº£n lÃ½ tÃ i khoáº£n hoáº·c Admin nháº¥n â€œÄá»“ng Ã½â€ má»™t gá»£i Ã½ táº¡o tÃ i khoáº£n tá»« mÃ n hÃ¬nh. |
| **Tiá»n Ä‘iá»u kiá»‡n** | Admin Ä‘Ã£ Ä‘Äƒng nháº­p vá»›i quyá»n quáº£n lÃ½ ngÆ°á»i dÃ¹ng. TÃªn Ä‘Äƒng nháº­p dá»± Ä‘á»‹nh táº¡o chÆ°a tá»“n táº¡i. |
| **Háº­u Ä‘iá»u kiá»‡n** | Má»™t báº£n ghi tÃ i khoáº£n má»›i Ä‘Æ°á»£c lÆ°u vÃ o CSDL. Audit Log ghi nháº­n hÃ nh Ä‘á»™ng â€œTáº¡o tÃ i khoáº£nâ€ kÃ¨m thÃ´ng tin ngÆ°á»i thá»±c hiá»‡n, thá»i gian, Ä‘á»‘i tÆ°á»£ng. NgÆ°á»i dÃ¹ng má»›i cÃ³ thá»ƒ Ä‘Äƒng nháº­p tÃ i. |
| **Luá»“ng sá»± kiá»‡n chÃ­nh** | Quáº£n trá»‹ viÃªn truy cáº­p vÃ o â€œQuáº£n lÃ½ tÃ i khoáº£nâ€ Nháº¥n nÃºt â€œThÃªm tÃ i khoáº£n má»›iâ€ Há»‡ thá»‘ng hiá»ƒn thá»‹ form gá»“m cÃ¡c trÆ°á»ng: TÃªn Ä‘Äƒng nháº­p (báº¯t buá»™c, khÃ´ng trÃ¹ng) Máº­t kháº©u táº¡m (báº¯t buá»™c, Ä‘Ã¡p á»©ng chÃ­nh sÃ¡ch Ä‘á»™ máº¡nh) Há» tÃªn Email (báº¯t buá»™c, Ä‘á»‹nh dáº¡ng há»£p lá»‡) Sá»‘ Ä‘iá»‡n thoáº¡i Vai trÃ² (dropdown: NÃ´ng tráº¡i, Váº­n chuyá»ƒn, Cá»­a hÃ ng, NhÃ¢n viÃªn kho, Adminâ€¦) Tráº¡ng thÃ¡i máº·c Ä‘á»‹nh: Hoáº¡t Ä‘á»™ng (cÃ³ thá»ƒ Ä‘á»ƒ lÃ  â€œHoáº¡t Ä‘á»™ngâ€ hoáº·c â€œChá» kÃ­ch hoáº¡tâ€) Admin nháº­p dá»¯ liá»‡u, nháº¥n â€œLÆ°uâ€. Há»‡ thá»‘ng kiá»ƒm tra tÃ­nh há»£p lá»‡: username duy nháº¥t, máº­t kháº©u Ä‘á»§ máº¡nh, email Ä‘Ãºng Ä‘á»‹nh dáº¡ng, cÃ¡c trÆ°á»ng báº¯t buá»™c khÃ´ng rá»—ng. Há»‡ thá»‘ng táº¡o tÃ i khoáº£n, lÆ°u vÃ o DB, ghi Audit Log. Hiá»ƒn thá»‹ thÃ´ng bÃ¡o â€œTáº¡o tÃ i khoáº£n thÃ nh cÃ´ngâ€. Danh sÃ¡ch tÃ i khoáº£n Ä‘Æ°á»£c lÃ m má»›i. |
| **Luá»“ng sá»± kiá»‡n phá»¥** | 5a.Gá»­i thÃ´ng tin qua email: Há»‡ thá»‘ng gá»­i email Ä‘áº¿n Ä‘á»‹a chá»‰ Ä‘Ã£ nháº­p kÃ¨m tÃªn Ä‘Äƒng nháº­p vÃ  máº­t kháº©u táº¡m, hÆ°á»›ng dáº«n Ä‘Äƒng nháº­p láº§n Ä‘áº§u vÃ  yÃªu cáº§u Ä‘á»•i máº­t kháº©u. 1a. Admin Ä‘á»“ng Ã½ táº¡o tÃ i khoáº£n tá»« danh sÃ¡ch Ä‘á» xuáº¥t táº¡o tÃ i khoáº£n  Há»‡ thá»‘ng hiá»ƒn thá»‹ danh sÃ¡ch cÃ¡c há»“ sÆ¡ Ä‘Æ°á»£c Ä‘á» xuáº¥t táº¡o tÃ i khoáº£n  Admin kiá»ƒm tra thÃ´ng tin vÃ  nháº¥n â€œÄá»“ng Ã½â€ Ä‘á»ƒ táº¡o tÃ i khoáº£n Há»‡ thá»‘ng trÃ­ch xuáº¥t dá»¯ liá»‡u tÆ°Æ¡ng á»©ng Ä‘á»ƒ táº¡o tÃ i khoáº£n. Chuyá»ƒn tiáº¿p Ä‘áº¿n bÆ°á»›c 3\. |
| **Luá»“ng sá»± kiá»‡n lá»—i** | 3a. TÃªn Ä‘Äƒng nháº­p Ä‘Ã£ tá»“n táº¡i:  Há»‡ thá»‘ng bÃ¡o lá»—i â€œTÃªn Ä‘Äƒng nháº­p Ä‘Ã£ tá»“n táº¡iâ€ vÃ  yÃªu cáº§u nháº­p láº¡i tÃªn Ä‘Äƒng nháº­p. 3b. Email/ Ä‘iá»‡n thoáº¡i khÃ´ng Ä‘Ãºng Ä‘á»‹nh dáº¡ng: ThÃ´ng bÃ¡o lá»—i: â€œKiá»ƒm tra láº¡i Ä‘á»‹nh dáº¡ng/ tÃªn miá»nâ€ |

![][image5]  
**UC05: Cáº¬P NHáº¬T THÃ”NG TIN TÃ€I KHOáº¢N**

| TÃªn Use-case | Cáº­p nháº­t thÃ´ng tin tÃ i khoáº£n |
| :---: | :---- |
| **ID** | UC05 |
| **Má»©c Ä‘á»™ quan trá»ng** | Trung bÃ¬nh |
| **TÃ¡c nhÃ¢n chÃ­nh** | NgÆ°á»i dÃ¹ng |
| **MÃ´ táº£** | NgÆ°á»i dÃ¹ng tá»± cáº­p nháº­t cÃ¡c thÃ´ng tin cÃ¡ nhÃ¢n nhÆ° há» tÃªn, email, sá»‘ Ä‘iá»‡n thoáº¡i vÃ  máº­t kháº©u cá»§a chÃ­nh mÃ¬nh. |
| **Sá»± kiá»‡n kÃ­ch hoáº¡t** | NgÆ°á»i dÃ¹ng chá»n â€œCáº­p nháº­t tÃ i khoáº£nâ€ tá»« menu ngÆ°á»i dÃ¹ng. |
| **Tiá»n Ä‘iá»u kiá»‡n** | NgÆ°á»i dÃ¹ng Ä‘Ã£ Ä‘Äƒng nháº­p. |
| **Háº­u Ä‘iá»u kiá»‡n** | ThÃ´ng tin má»›i Ä‘Æ°á»£c lÆ°u vÃ o CSDL. Audit Log ghi nháº­n thay Ä‘á»•i (ngÆ°á»i thá»±c hiá»‡n, thá»i gian, trÆ°á»ng thay Ä‘á»•i). Náº¿u thay Ä‘á»•i email/sá»‘ Ä‘iá»‡n thoáº¡i, thÃ´ng tin liÃªn há»‡ phá»¥c vá»¥ thÃ´ng bÃ¡o Ä‘Æ°á»£c cáº­p nháº­t. |
| **Luá»“ng sá»± kiá»‡n chÃ­nh** | NgÆ°á»i dÃ¹ng truy cáº­p vÃ o â€œTÃ i khoáº£nâ€ Nháº¥n nÃºt â€œCáº­p nháº­t thÃ´ng tinâ€ Há»‡ thá»‘ng hiá»ƒn thá»‹ form chá»©a cÃ¡c thÃ´ng tin hiá»‡n táº¡i: há» tÃªn, email, sá»‘ Ä‘iá»‡n thoáº¡i. TÃªn Ä‘Äƒng nháº­p chá»‰ hiá»ƒn thá»‹ á»Ÿ dáº¡ng chá»‰ Ä‘á»c. NgÆ°á»i dÃ¹ng chá»‰nh sá»­a cÃ¡c trÆ°á»ng Ä‘Æ°á»£c phÃ©p. Nháº¥n â€œLÆ°u thay Ä‘á»•iâ€. Há»‡ thá»‘ng kiá»ƒm tra: email khÃ´ng trÃ¹ng vá»›i ngÆ°á»i khÃ¡c, sá»‘ Ä‘iá»‡n thoáº¡i há»£p lá»‡. LÆ°u dá»¯ liá»‡u, ghi Audit Log. ThÃ´ng bÃ¡o â€œCáº­p nháº­t thÃ´ng tin thÃ nh cÃ´ngâ€. |
| **Luá»“ng sá»± kiá»‡n phá»¥** | 2a. Äá»•i máº­t kháº©u: NgÆ°á»i dÃ¹ng nháº­p máº­t kháº©u hiá»‡n táº¡i, máº­t kháº©u má»›i, xÃ¡c nháº­n máº­t kháº©u má»›i. Há»‡ thá»‘ng kiá»ƒm tra máº­t kháº©u cÅ© Ä‘Ãºng, máº­t kháº©u má»›i Ä‘áº¡t yÃªu cáº§u. Cáº­p nháº­t hash máº­t kháº©u, ghi Audit Log. YÃªu cáº§u Ä‘Äƒng nháº­p láº¡i. |
| **Luá»“ng sá»± kiá»‡n lá»—i** | 2a.2. Máº­t kháº©u cÅ© khÃ´ng Ä‘Ãºng: BÃ¡o lá»—i â€œMáº­t kháº©u hiá»‡n táº¡i khÃ´ng chÃ­nh xÃ¡câ€. 4a Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng bá»Ÿi tÃ i khoáº£n khÃ¡c: ThÃ´ng bÃ¡o â€œEmail nÃ y Ä‘Ã£ Ä‘Æ°á»£c Ä‘Äƒng kÃ½â€. |

![][image6]  
**UC06: PHÃ‚N QUYá»€N NGÆ¯á»œI DÃ™NG**

| TÃªn Use-case | PhÃ¢n quyá»n ngÆ°á»i dÃ¹ng |
| :---: | :---- |
| **ID** | UC06 |
| **Má»©c Ä‘á»™ quan trá»ng** | Cao |
| **TÃ¡c nhÃ¢n chÃ­nh** | Quáº£n trá»‹ viÃªn |
| **MÃ´ táº£** | Quáº£n trá»‹ viÃªn gÃ¡n vai trÃ² hoáº·c bá»™ quyá»n chi tiáº¿t cho má»™t tÃ i khoáº£n, tá»« Ä‘Ã³ kiá»ƒm soÃ¡t chá»©c nÄƒng ngÆ°á»i dÃ¹ng Ä‘Ã³ Ä‘Æ°á»£c phÃ©p truy cáº­p. |
| **Sá»± kiá»‡n kÃ­ch hoáº¡t** | Admin chá»n má»™t tÃ i khoáº£n vÃ  nháº¥n â€œPhÃ¢n quyá»nâ€ hoáº·c thay Ä‘á»•i trá»±c tiáº¿p trong form chi tiáº¿t. |
| **Tiá»n Ä‘iá»u kiá»‡n** | Admin Ä‘Ã£ Ä‘Äƒng nháº­p, cÃ³ quyá»n quáº£n lÃ½ ngÆ°á»i dÃ¹ng. TÃ i khoáº£n má»¥c tiÃªu Ä‘ang tá»“n táº¡i. |
| **Háº­u Ä‘iá»u kiá»‡n** | Vai trÃ²/quyá»n cá»§a tÃ i khoáº£n Ä‘Æ°á»£c cáº­p nháº­t trong DB. Audit Log ghi nháº­n: ai phÃ¢n quyá»n, tÃ i khoáº£n nÃ o, vai trÃ² cÅ© â€“ vai trÃ² má»›i. áº¢nh hÆ°á»Ÿng Ä‘áº¿n phiÃªn hiá»‡n táº¡i: Náº¿u lÃ  tÃ i khoáº£n Ä‘ang online, há»‡ thá»‘ng cÃ³ thá»ƒ buá»™c Ä‘Äƒng xuáº¥t. |
| **Luá»“ng sá»± kiá»‡n chÃ­nh** | Quáº£n trá»‹ viÃªn truy cáº­p vÃ o â€œQuáº£n lÃ½ tÃ i khoáº£nâ€ Nháº¥n nÃºt â€œPhÃ¢n quyá»n ngÆ°á»i dÃ¹ngâ€ Há»‡ thá»‘ng hiá»ƒn thá»‹ danh sÃ¡ch thÃ´ng tin tÃ i khoáº£n kÃ¨m vai trÃ² hiá»‡n táº¡i. Admin chá»n tÃ i khoáº£n cáº§n phÃ¢n quyá»n tá»« danh sÃ¡ch. Admin chá»n vai trÃ² má»›i (vÃ­ dá»¥: chuyá»ƒn tá»« â€œCá»­a hÃ ngâ€ thÃ nh â€œNÃ´ng tráº¡iâ€) . Admin nháº¥n â€œLÆ°u phÃ¢n quyá»nâ€. Há»‡ thá»‘ng xÃ¡c nháº­n thay Ä‘á»•i, cáº­p nháº­t, ghi Audit Log. ThÃ´ng bÃ¡o â€œPhÃ¢n quyá»n thÃ nh cÃ´ngâ€. |
| **Luá»“ng sá»± kiá»‡n phá»¥** | 3a. PhÃ¢n quyá»n hÃ ng loáº¡t: Admin chá»n nhiá»u tÃ i khoáº£n vÃ  gÃ¡n cÃ¹ng má»™t vai trÃ² â€“ há»‡ thá»‘ng cáº­p nháº­t láº§n lÆ°á»£t vÃ  ghi log cho tá»«ng tÃ i khoáº£n. |
| **Luá»“ng sá»± kiá»‡n lá»—i** | KhÃ´ng cÃ³. |

![][image7]**UC07: THAY Äá»”I TRáº NG THÃI TÃ€I KHOáº¢N**

| TÃªn Use-case | KhÃ³a/ VÃ´ hiá»‡u hÃ³a tÃ i khoáº£n |
| :---: | :---- |
| **ID** | UC07 |
| **Má»©c Ä‘á»™ quan trá»ng** | Cao |
| **TÃ¡c nhÃ¢n chÃ­nh** | Quáº£n trá»‹ viÃªn |
| **MÃ´ táº£** | Quáº£n trá»‹ viÃªn thay Ä‘á»•i tráº¡ng thÃ¡i tÃ i khoáº£n thÃ nh â€œKhÃ³aâ€ (vÃ´ hiá»‡u hÃ³a) Ä‘á»ƒ ngÄƒn ngÆ°á»i dÃ¹ng Ä‘Äƒng nháº­p, hoáº·c má»Ÿ khÃ³a (kÃ­ch hoáº¡t trá»Ÿ láº¡i) khi cáº§n. |
| **Sá»± kiá»‡n kÃ­ch hoáº¡t** | Admin nháº¥n nÃºt â€œKhÃ³aâ€ hoáº·c â€œMá»Ÿ khÃ³aâ€ tÆ°Æ¡ng á»©ng vá»›i má»™t tÃ i khoáº£n. |
| **Tiá»n Ä‘iá»u kiá»‡n** | Admin Ä‘Ã£ Ä‘Äƒng nháº­p, cÃ³ quyá»n quáº£n lÃ½ ngÆ°á»i dÃ¹ng. TÃ i khoáº£n má»¥c tiÃªu tá»“n táº¡i. Äá»‘i vá»›i khÃ³a: tÃ i khoáº£n Ä‘ang á»Ÿ tráº¡ng thÃ¡i Hoáº¡t Ä‘á»™ng. Äá»‘i vá»›i má»Ÿ khÃ³a: tÃ i khoáº£n Ä‘ang á»Ÿ tráº¡ng thÃ¡i KhÃ³a. |
| **Háº­u Ä‘iá»u kiá»‡n** | Tráº¡ng thÃ¡i tÃ i khoáº£n Ä‘Æ°á»£c cáº­p nháº­t. Náº¿u lÃ  khÃ³a: má»i phiÃªn hiá»‡n táº¡i cá»§a tÃ i khoáº£n Ä‘Ã³ bá»‹ há»§y; tÃ i khoáº£n khÃ´ng thá»ƒ Ä‘Äƒng nháº­p. Audit Log ghi nháº­n hÃ nh Ä‘á»™ng khÃ³a/má»Ÿ khÃ³a kÃ¨m thÃ´ng tin ngÆ°á»i thá»±c hiá»‡n. |
| **Luá»“ng sá»± kiá»‡n chÃ­nh (KhÃ³a)** | Quáº£n trá»‹ viÃªn truy cáº­p vÃ o â€œQuáº£n lÃ½ tÃ i khoáº£nâ€ Nháº¥n nÃºt â€œKhÃ³a/ VÃ´ hiá»‡u hÃ³a tÃ i khoáº£nâ€ Admin chá»n tÃ i khoáº£n vÃ  nháº¥n â€œKhÃ³aâ€. Há»‡ thá»‘ng hiá»ƒn thá»‹ há»™p thoáº¡i xÃ¡c nháº­n: â€œBáº¡n cÃ³ cháº¯c cháº¯n muá»‘n khÃ³a tÃ i khoáº£n â€¦? NgÆ°á»i dÃ¹ng sáº½ khÃ´ng thá»ƒ Ä‘Äƒng nháº­p.â€ Admin xÃ¡c nháº­n. Há»‡ thá»‘ng cáº­p nháº­t tráº¡ng thÃ¡i \= 0 (KhÃ³a), Ä‘á»“ng thá»i vÃ´ hiá»‡u hÃ³a má»i token/session Ä‘ang hoáº¡t Ä‘á»™ng cá»§a tÃ i khoáº£n. Ghi Audit Log. Hiá»ƒn thá»‹ thÃ´ng bÃ¡o â€œTÃ i khoáº£n Ä‘Ã£ bá»‹ khÃ³aâ€ vÃ  tráº¡ng thÃ¡i trÃªn danh sÃ¡ch chuyá»ƒn thÃ nh â€œBá»‹ khÃ³aâ€. |
| **Luá»“ng sá»± kiá»‡n chÃ­nh (Má»Ÿ khÃ³a)** | Admin chá»n tÃ i khoáº£n Ä‘ang bá»‹ khÃ³a, nháº¥n â€œMá»Ÿ khÃ³aâ€. XÃ¡c nháº­n. Cáº­p nháº­t tráº¡ng thÃ¡i \= 1 (Hoáº¡t Ä‘á»™ng), ghi Audit Log. ThÃ´ng bÃ¡o â€œMá»Ÿ khÃ³a tÃ i khoáº£n thÃ nh cÃ´ngâ€. |
| **Luá»“ng sá»± kiá»‡n phá»¥** | KhÃ´ng cÃ³. |
| **Luá»“ng sá»± kiá»‡n lá»—i** | KhÃ´ng cÃ³. |

![][image8]  


