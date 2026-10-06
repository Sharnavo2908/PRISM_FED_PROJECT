// ================= LOGIN AND SIGNUP =================

// default admin details
const ADMIN_USERNAME='admin';
const ADMIN_PASSWORD='admin123';

// the USER / ADMIN page saves which button was clicked
function SET_ROLE(role){
    sessionStorage.setItem('role',role);
}

function GET_ROLE(){
    let role=sessionStorage.getItem('role');
    if(role==null){
        role='user';
    }
    return role;
}

// all accounts are saved in localStorage as 'users'
function GET_USERS(){
    let users=JSON.parse(localStorage.getItem('users'));
    if(users==null){
        users=[];
    }
    return users;
}

function SIGNUP(){
    event.preventDefault();
    let name=document.getElementById('name').value.trim();
    let username=document.getElementById('username').value.trim();
    let email=document.getElementById('email').value.trim();
    let password=document.getElementById('password').value;
    let confirm_password=document.getElementById('cnfirmpassword').value;
    let role=GET_ROLE();
    let users=GET_USERS();

    if(password!=confirm_password){
        alert('Passwords do not match');
        return;
    }

    // the default admin username cannot be used for a new account
    if(username==ADMIN_USERNAME){
        alert('Username already taken');
        return;
    }

    // username must be new for this role
    for(let i=0;i<users.length;i++){
        if(users[i].username==username && users[i].role==role){
            alert('Username already taken');
            return;
        }
    }

    users.push({name:name,username:username,email:email,password:password,role:role});
    localStorage.setItem('users',JSON.stringify(users));
    alert('Account created. Please login');
    window.location.href='loginpage.html';
}

function LOGIN(){
    event.preventDefault();
    let username=document.getElementById('username').value.trim();
    let password=document.getElementById('password').value;

    // direct admin login: username admin and password admin123
    // works every time, even on a new browser or the GitHub site
    if(username==ADMIN_USERNAME && password==ADMIN_PASSWORD){
        sessionStorage.setItem('role','admin');
        sessionStorage.setItem('current_user',username);
        window.location.href='rating_check_dashboard.html';
        return;
    }

    // normal login for other accounts
    let role=GET_ROLE();
    let users=GET_USERS();

    for(let i=0;i<users.length;i++){
        if(users[i].username==username && users[i].password==password && users[i].role==role){
            sessionStorage.setItem('current_user',username);
            if(role=='admin'){
                window.location.href='rating_check_dashboard.html';
            }
            else{
                window.location.href='user_dashboard.html';
            }
            return;
        }
    }
    alert('Wrong username or password');
}

// make sure the default admin account is always saved
function SEED_ADMIN(){
    let users=GET_USERS();
    for(let i=0;i<users.length;i++){
        if(users[i].role=='admin' && users[i].username==ADMIN_USERNAME){
            users[i].password=ADMIN_PASSWORD;
            localStorage.setItem('users',JSON.stringify(users));
            return;
        }
    }
    users.push({name:'Admin',username:ADMIN_USERNAME,email:'',password:ADMIN_PASSWORD,role:'admin'});
    localStorage.setItem('users',JSON.stringify(users));
}
SEED_ADMIN();

// put this on the pages that need a login
function CHECK_LOGIN(role){
    if(sessionStorage.getItem('current_user')==null || GET_ROLE()!=role){
        alert('Please login first');
        window.location.href='index.html';
    }
}

function LOGOUT(){
    sessionStorage.removeItem('current_user');
    sessionStorage.removeItem('role');
}


// ================= RATING DASHBOARD (user) =================

let rating=0;

// feedbacks are saved in localStorage as 'feedbacks'
function GET_FEEDBACKS(){
    let feedbacks=JSON.parse(localStorage.getItem('feedbacks'));
    if(feedbacks==null){
        feedbacks=[];
    }
    return feedbacks;
}

// the clicked box sends its topic in the link, show it as the heading
function SHOW_TOPIC(){
    let topic=new URLSearchParams(window.location.search).get('topic');
    if(topic==null){
        window.location.href='user_dashboard.html';
        return;
    }
    document.getElementById('topic').textContent=topic;
}

function SET_STARS(n){
    rating=n;
    let stars=document.getElementsByClassName('star');
    for(let i=0;i<stars.length;i++){
        if(i<n){
            stars[i].classList.add('on');
        }
        else{
            stars[i].classList.remove('on');
        }
    }
}

function SUBMIT_FEEDBACK(){
    event.preventDefault();
    let topic=document.getElementById('topic').textContent;
    let review=document.getElementById('review').value.trim();

    if(rating==0){
        alert('Please select the stars');
        return;
    }
    if(review==''){
        alert('Please write your feedback');
        return;
    }

    let feedbacks=GET_FEEDBACKS();
    feedbacks.push({topic:topic,username:sessionStorage.getItem('current_user'),stars:rating,review:review,date:new Date().toLocaleString()});
    localStorage.setItem('feedbacks',JSON.stringify(feedbacks));
    alert('Feedback submitted. Thank you!');
    window.location.href='user_dashboard.html';
}


// ================= RATING CHECK DASHBOARD (admin) =================

function SHOW_FEEDBACK(){
    let feedbacks=GET_FEEDBACKS();
    let filter=document.getElementById('filter').value;
    let table_body=document.getElementById('table_body');
    table_body.innerHTML='';

    let count=0;
    let total_stars=0;

    // newest feedback first
    for(let i=feedbacks.length-1;i>=0;i--){
        let f=feedbacks[i];
        if(filter!='all' && f.topic!=filter){
            continue;
        }
        count++;
        total_stars+=f.stars;

        let tr=document.createElement('tr');
        let stars_text='\u2605'.repeat(f.stars)+'\u2606'.repeat(5-f.stars)+' ('+f.stars+'/5)';
        let row_values=[count,f.topic,f.username,stars_text,f.review,f.date];

        for(let j=0;j<row_values.length;j++){
            let td=document.createElement('td');
            td.textContent=row_values[j];
            tr.appendChild(td);
        }
        table_body.appendChild(tr);
    }

    if(count==0){
        document.getElementById('summary').textContent='No feedback yet';
    }
    else{
        document.getElementById('summary').textContent='Total feedback: '+count+'  |  Average stars: '+(total_stars/count).toFixed(1)+' / 5';
    }
}