var express = require('express'); //설치한 express module을 불러와서 변수(express)에 담는다.
var app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const fs = require('fs');

async function getDBConnection(){
    const db = await sqlite.open({
        filename:'product.db',
        driver: sqlite3.Database
    });
    return db;
}


app.get('/', async function(req,res){ // '/'위치에 'get'요청을 받는 경우,
    
    let db = await getDBConnection();
    //await db.run(`insert into images(image_name, image_path) values('js_1.jpg', './images/')`);
    let rows = await db.all(`select * from product`);
    await db.close();
    product_info = '';
    let arrContent = [];
    for (var i=0; i< rows.length; i++){
        var obj = {"id": rows[i]['product_id'], "name": rows[i]['product_title'], "price": rows[i]['product_price'], "type": rows[i]['product_category'], "img": rows[i]['product_image']}
        arrContent.push(obj);
    }
    changeContent("all")

    
    function changeContent(value) {
        html = '<section id="content" class="right">';
      
        for(var i = 0; i < arrContent.length; i++){
          if(compare(value, arrContent[i].type) || compare(value, arrContent[i].name) || compare(value, "all")) {
            var name = arrContent[i].name;
            var output = "<div class=\"box\"><img src=\"" + arrContent[i].img + "\">" + 
            "<button type=\"button\" class=\"button\" onclick=\"redirectToProduct(" + arrContent[i].id + ")\">Click to see more</button>" +
            "<h4 id=\"" + name + "\">" + "</h4></div>";
      
            html += output;
          }
        }
      
        html += '</section>';
        console.log(html);
      }


      
    function compare(val1, val2) {
        str1 = val1.toLowerCase();
        str2 = val2.toLowerCase();
        return str2.includes(str1);
    }

    app.post('/product/:product_id', (req, res) => {
        const productId = req.params.product_id;
        let requestBody = '';
      
        req.on('data', (chunk) => {
          requestBody += chunk;
        });
      
        req.on('end', () => {
          const review = decodeURIComponent(requestBody.split('=')[1]); // 사용자가 작성한 리뷰 내용
      
          // comment.json 파일을 읽고, 리뷰 정보 업데이트
          fs.readFile('comment.json', 'utf8', (err, data) => {
            if (err) {
              console.error('Failed to read comment file:', err);
              res.status(500).json({ error: 'Failed to read comment file' });
              return;
            }
      
            const comments = JSON.parse(data);
      
            // productId에 해당하는 제품의 리뷰 정보를 가져옵니다.
            const productComments = comments[productId] || [];
      
            // 새로운 리뷰를 추가합니다.
            productComments.push({ content: review });
      
            // 리뷰 정보를 comment.json 파일에 업데이트합니다.
            comments[productId] = productComments;
      
            // comment.json 파일 업데이트
            fs.writeFile('comment.json', JSON.stringify(comments), 'utf8', (err) => {
              if (err) {
                console.error('Failed to update comment file:', err);
                res.status(500).json({ error: 'Failed to update comment file' });
                return;
              }
      
              // 제품 상세 페이지로 리디렉션
              res.redirect(`/product/${productId}`);
            });
          });
        });
      });



    app.get('/product/:product_id', async function(req, res) {
        const productId = req.params.product_id;

        
        let db = await getDBConnection();
        let row = await db.get('SELECT * FROM product WHERE product_id = ?', productId);
        await db.close();
      
        // comment.json
        fs.readFile('comment.json', 'utf8', (err, data) => {
          if (err) {
            console.error('Failed to read comment file:', err);
            res.status(500).json({ error: 'Failed to read comment file' });
            return;
          }
      
          const comments = JSON.parse(data);
      
          // productId에 해당하는 제품의 리뷰 정보를 가져옵니다.
          const productComments = comments[productId] || [];

  
          if (row) {
            // 상세 페이지 렌더링 코드 작성
            console.log(output1);
            var output1 = `
            <!DOCTYPE html>
            <html>
                <head>
                <mate charset="utf-8">
                <title>product</title>
                <style type = "text/css">
                .divall{/*전체감싸는*/
                    max-width:1020px;
                    width:100%;
                    margin:0 auto;
                }    
                .p-head{/*title 선*/
                    background: rgb(167, 165, 165);
                    width:100%;
                    max-width:1020px;
                    height:10px;
                }
                .title2{font-size:30px;font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                    animation:none;display:flex;justify-content: center;}
                .productdiv{
                    display:flex;
                }
                .a123{margin-right:65px;}
                .zz{width : 250px;}
                </style>
                
                </head>
                <body>
                <div class="divall">
                    <p class="p-head"></p> <!--width는 1020px로-->
                    <header>
                        <text class="title2">&nbsp Welcome to internet shop!!</text>
                    </header>
                    <p class="p-head"></p>

              
                <section>
                <div class="productdiv">
                    <div>
                        <img src="/${row.product_image}">
                    </div>
                    <div class="a123">
                        <p>
                            product_id : ${row.product_id}
                        </p>
                        <p>
                            product_image : ${row.product_image}
                        </p>
                        <p>
                            product_title : ${row.product_title}
                        </p>
                        <p>
                            product_price : ${row.product_price}
                        </p>
                        <p>
                            product_category : ${row.product_category}
                        </p>
                    </div>
                    <div>
                        <form method="post" action="">
                            <p>Submit your review</p>
                            <p>&nbsp<input name = "content" type = "text" placeholder="review" size= "30" required></p>
                            <p><input type = "submit" value = "submit"></p>
                        </form>
                        <p class="p-head zz"></p>
                        <p><strong>Feedback</strong></p>
                        <div>
                        ${productComments.map(comment => `<p>${comment.content}</p>`).join('')}
                        </div>
                
                    </div>
                    
                </div>
                </section>
                </div>
            </body>
            </html>
            `;
            res.send(output1);
          } else {
            // 상세 페이지를 찾을 수 없는 경우 에러 처리
            res.status(404).send('Product not found');
          }
        });
      });
      

    console.log(output)
    var output = 
    `<!DOCTYPE html>
    <html>
        <head>
        <mate charset="utf-8">
        <title>Index</title>
        <link rel="stylesheet" type="text/css" href="main.css">
        <style type = "text/css">
        </style>
        
        </head>
        <body>
        <div class="divall">
            <p class="p-head"></p> <!--width는 1020px로-->
            <header>
                <text class="title">&nbsp Welcome to internet shop!!</text>
            </header>
            <p class="p-head"></p>
            <nav class="flexible-container">
                <div class="flex-item"><a href='login.html'>로그인</a></div>
                <div class="flex-item2"><a href='signup.html'>회원가입</a></div>
                <div class="flex-item3"><u>메인페이지</u></div>
      
        <section>
            <br>
            <section id="category" class="left">
                <br><label>Choose a category:</label><br>
                <select name="list" onchange=changeContent(value)>
                    <option value="all">All</option>
                    <option value="macbook">Macbook</option>
                    <option value="ipad">iPad</option>
                    <option value="iphone">iPhone</option>
                    <option value="applewatch">Applewatch</option>
                </select>
                <br><label>Enter search term:</label><br>
                <input type="text" name="search" id="search" placeholder ="e.g. macbook" onchange=changeContent(value)>


            </section>

            ${html}
            
        </section>
        <p>Click to see more 버튼을 누르면 제품에 대한 상세페이지로 이동합니다. product/:product_id</p>
        <script>
        function redirectToProduct(num) {
            var redirectURL = "/product/" + num; // 리디렉션할 URL 생성
            window.location.href = redirectURL; // 리디렉션 수행
        }

        
        </script>

    </body>
    </html>
    `;
    res.send(output)
});

//static file을 서버에서 전달하도록 설정
app.use(express.static("public"));//css와 이미지가져오기

var port = 3000; //사용할 포트 번호를 port 변수에 넣음
app.listen(port, function(){
    console.log('server on! http:localhost: '+port);
});
