
// const url = 'https://realtimetweeter.herokuapp.com';
const url = "http://localhost:3000";



const signup = () => {

    var userEmail = document.getElementById("email").value.toLowerCase();
    var userPassword = document.getElementById("password").value
    var userName = document.getElementById("name").value

    let obj = {
        userEmail: userEmail,
        userPassword: userPassword,
        userName: userName,
    };

    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/signup");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify(obj));

    Http.onreadystatechange = (e) => {

        if (Http.readyState === 4) {
            let jsonRes = JSON.parse(Http.responseText)
            console.log(Http.status);
            if (Http.status === 200) {
                alert(jsonRes.message);
                window.location.href = "login.html";
            }
            else {
                alert(jsonRes.message);
            }



        }
    }
    return false;
}

const login = () => {

    var userEmail = document.getElementById("email").value.toLowerCase();
    var userPassword = document.getElementById("password").value

    obj = {
        userEmail: userEmail,
        userPassword: userPassword,
    }
    // console.log(obj);

    const Http = new XMLHttpRequest();

    Http.open("POST", url + "/login");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify(obj));

    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {
            console.log(Http.responseText);
            let jsonRes = JSON.parse(Http.responseText);
            if (Http.status === 200) {
                alert(jsonRes.message);
                localStorage.setItem("currentUser", JSON.stringify(jsonRes));
            }
            else {
                alert(jsonRes.message);
            }

        }
    }
    return false;
}

const post = () => {

    let tweetText = document.getElementById("userPost").value;

    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/tweet");
    Http.setRequestHeader("Content-Type", "application/json");

    Http.send(JSON.stringify({
        userName: currentUser.userName,
        tweetText: tweetText,
    }));

    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {
            jsonRes = JSON.parse((Http.responseText));
            console.log("posted success");
            document.getElementById("userPost").innerHTML = "";
        }
    }
}

const getTweets = () => {

    if (localStorage.getItem("currentUser")) {
        currentUser = JSON.parse(localStorage.getItem("currentUser"));
        document.getElementById("welcomeUser").innerHTML = `Welcome, ${currentUser.userName}`
    }

    if (!currentUser) {
        document.getElementById("welcomeUser").innerHTML = "Signup and tweet your thoughts away";
        document.getElementById("lgBtn").innerText = "Signup Now";
        userPost.style.display = "none";
        postBtn.style.display = "none";
    }

    const Http = new XMLHttpRequest();
    Http.open("GET", url + "/tweets");
    Http.send();
    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {

            let tweets = JSON.parse((Http.responseText));

            for (let i = 0; i < tweets.length; i++) {
                // console.log(tweets[i].userName)

                var eachTweet = document.createElement("li");
                eachTweet.innerHTML =
                    `<h4 class="userName">
                    ${tweets[i].userName}
                </h4> 
                <p class="userPost">
                    ${tweets[i].tweetText}
                </p>`;
                // console.log(`User: ${tweets[i]} ${tweets[i].userPosts[j]}`)
                document.getElementById("posts").appendChild(eachTweet)

            }
        }
    }
}



let logout = () => {
    if (currentUser === null || currentUser === undefined) {
        window.location.href = "index.html";
    }
    else {
        currentUser = null;
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    }

}
// DONE WITH IT