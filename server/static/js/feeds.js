Dropzone.autoDiscover = false;

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/feeds');
var imagePath = [];
var friend_recommend = [];


var alertMini = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    width: '22rem',
    padding: '0.5rem',
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});


class Profile {
    constructor() {
        this.fullName = ''
        this.email = ''
        this.profile = ''
    }
}


class FriendRecommendOrganize {
    constructor() {
        this.queue = [];
        this.execute = [];
        this.count = 1
        this.countTarget = document.getElementById("friendsRecommend_friends_count")
        this.parent = document.getElementById('friendsRecommend_friends');

    }
    async Interrupt(friend) {
        if (this.execute.length > 0) { this.queue.splice(0, 0, this.execute.pop()); }
        this.execute.splice(0, 0, friend);
        this.Execute()
    }

    async displayCount() {
        this.countTarget.innerHTML = this.queue.length + this.execute.length
    }

    async addFriend(friend) {
        let status = true
        for (let i of this.queue.concat(this.execute)) {
            if (i.id === friend.id) {
                status = false
                break;
            }
        }
        if (status) { this.queue.push(friend); }
    }

    addFriends(arrar) {
        if (arrar.length > 0) {
            arrar.forEach((value) => {
                this.addFriend(value);
            })
        }
    }

    createElement(friend) {
        let profile = friend.profile;
        if (profile === null) { profile = '' }
        let element = document.createElement('div');
        element.setAttribute('id', `FriendRecommend_${friend.id}`);
        element.setAttribute('class', 'friend animate__animated animate__fadeIn');
        element.innerHTML = `
        <div class="profile">
        <div class="img">
            <img class="img" src="${profile}" alt="">
        </div>
        <div class="fullname">${friend.fullName}
            <span>Recommend friends for you</span>
        </div>
    </div>
    <div class="action">
        <button id="newFriend" onClick="followInFeed('${friend.id}');" class="action-add">Follow</button>
        <button id="newFriend" onClick="removeFollowInFeed('${friend.id}');" class="action-remove">Remove</button>
    </div>`;
        this.parent.appendChild(element);
    }

    displayNone() {
        this.parent.innerHTML = '<div class="none">none</div>'
    }

    Execute() {
        this.removeChild()
        if (this.execute.length > 0) {
            for (let i = 0; i < this.execute.length; i++) {
                if (this.execute[i] !== undefined) {
                    this.createElement(this.execute[i]);
                }
            }
        } else {
            this.displayNone()
        }
        this.displayCount()
    }

    Organize() {
        if (this.execute.length < this.count) {
            if (this.queue.length > 0 || this.execute.length > 0) {
                for (let i = 0; i < this.count; i++) {
                    if (this.queue[0] !== undefined) {
                        this.execute.push(this.queue.shift())
                    }
                }
            }
        }
        this.Execute()
    }
    removeQueue() {
        this.execute.shift();
    }
    removeQueueById(id) {
        let temp = this.execute.filter((value) => { return value.id != id })
        this.execute = temp
    }

    removeChild() {
        if (this.parent.children.length > 0) {
            let len = this.parent.children.length
            for (let i = 0; i < len; i++) {
                this.parent.removeChild(this.parent.children[0]);
            }
        }
    }
}
class FriendRequiredOrganize {
    constructor() {
        this.queue = [];
        this.execute = [];
        this.count = 2
        this.countTarget = document.getElementById("friendsRequired_friends_count")
        this.parent = document.getElementById('friendsRequired_friends');
    }

    async Interrupt(friend) {
        this.queue.splice(0, 0, this.execute.pop());
        this.execute.splice(0, 0, friend);
        this.Execute()
    }

    async displayCount() {
        this.countTarget.innerHTML = this.queue.length + this.execute.length
    }

    async addFriend(friend) {
        let status = true
        for (let i of this.queue.concat(this.execute)) {
            if (i.id === friend.id) {
                status = false
                break;
            }
        }
        if (status) { this.queue.push(friend); }
    }

    async addFriends(arrar) {
        if (arrar.length > 0) {
            arrar.forEach((value) => {
                this.addFriend(value);
            })
        }
    }

    async createElement(friend) {
        let profile = friend.profile;
        if (profile === "NULL") {
            profile = '';
        }
        let element = document.createElement('div');
        element.setAttribute('id', `FriendRequired_${friend.id}`);
        element.setAttribute('class', 'friend animate__animated animate__fadeIn');
        element.innerHTML = `
        <div class="profile">
        <div class="img">
            <img class="img" src="${profile}" alt="">
        </div>
        <div class="fullname">${friend.fullName}
            <span>wants to add you to friends</span>
        </div>
    </div>
    <div class="action">
        <button id="newFriend" onClick="acceptInFeed('${friend.id}');" class="action-add">Accept</button>
        <button id="newFriend" onClick="removeAcceptInFeed('${friend.id}');" class="action-remove">Remove</button>
    </div>`;
        this.parent.appendChild(element);
    }

    async displayNone() {
        this.parent.innerHTML = '<div class="none">none</div>'
    }

    Execute() {
        this.removeChild()
        if (this.execute.length > 0) {
            for (let i = 0; i < this.execute.length; i++) {
                if (this.execute[i] !== undefined) {
                    this.createElement(this.execute[i]);
                }
            }
        } else {
            this.displayNone()
        }
        this.displayCount()
    }

    Organize() {
        if (this.execute.length < this.count) {
            if (this.queue.length > 0 || this.execute.length > 0) {
                for (let i = 0; i < this.count; i++) {
                    if (this.queue[0] !== undefined) {
                        this.execute.push(this.queue.shift())
                    }
                }

            }
        }
        this.Execute()
    }
    removeQueue() {
        this.execute.shift();
    }
    removeQueueById(id) {
        let temp = this.execute.filter((value) => { return value.id != id })
        this.execute = temp
    }

    removeChild() {
        if (this.parent) {
            if (this.parent.children.length > 0) {
                let len = this.parent.children.length
                for (let i = 0; i < len; i++) {
                    this.parent.removeChild(this.parent.children[0]);
                }
            }
        }

    }
}
class FriendContactsOrganize {
    constructor() {
        this.execute = [];
        this.countTarget = document.getElementById("friendsContacts_friends_count")
        this.parent = document.getElementById('friendsContacts_friends');
    }

    async Interrupt(friend) {
        this.execute.splice(0, 0, friend);
        this.Execute()
    }

    async displayCount() {
        this.countTarget.innerHTML = this.execute.length
    }

    async addFriend(friend) {
        let status = true
        for (let i of this.execute) {
            if (i.id === friend.id) {
                status = false
                break;
            }
        }
        if (status) { this.execute.push(friend); }
    }

    async addFriends(arrar) {
        if (arrar.length > 0) {
            arrar.forEach((value) => {
                this.addFriend(value);
            })
        }
    }

    async createElement(friend) {
        let profile = friend.profile;
        if (profile === null) { profile = '' }
        let element = document.createElement('div');
        element.setAttribute('id', `FriendContact_${friend.id}`);
        element.setAttribute('class', 'friend animate__animated animate__fadeIn');
        element.innerHTML = `
    <div class="friend">
            <div class="profile">
                <div class="img">
                    <img class="img" src="${profile}" alt="">
                </div>
                <div class="fullname">${friend.fullName}</div>
            </div>
        </div>
    `;
        this.parent.appendChild(element);
    }

    async displayNone() {
        this.parent.innerHTML = '<div class="none">none</div>'
    }

    Execute() {
        this.removeChild()
        if (this.execute.length > 0) {
            for (let i = 0; i < this.execute.length; i++) {
                if (this.execute[i] !== undefined) {
                    this.createElement(this.execute[i]);
                }
            }
        } else { this.displayNone() }
        this.displayCount()
    }

    Organize() {
        this.removeChild()
        this.Execute()
    }
    removeChild() {
        if (this.parent.children.length > 0) {
            let len = this.parent.children.length
            for (let i = 0; i < len; i++) {
                this.parent.removeChild(this.parent.children[0]);
            }
        }
    }
}



var FriendRecomOrganize = new FriendRecommendOrganize();
var FriendReqOrganize = new FriendRequiredOrganize();
var FriendConOrganize = new FriendContactsOrganize();
var profile = new Profile();

async function followInFeed(id) {
    await socket.emit("follow", {
        follow_id: id,
        name: profile.fullName
    });
    FriendRecomOrganize.removeQueueById(id)
    FriendRecomOrganize.Organize();
}
async function removeFollowInFeed(id) {
    FriendRecomOrganize.removeQueueById(id)
    FriendRecomOrganize.Organize();
}
async function acceptInFeed(id) {
    await socket.emit("accept", {
        follow_id: id,
        name: profile.fullName
    });
    FriendReqOrganize.removeQueueById(id)
    FriendReqOrganize.Organize();
}
async function removeAcceptInFeed(id) {
    FriendReqOrganize.removeQueueById(id)
    FriendReqOrganize.Organize();
}


async function clickMessage() {
    socket.send(document.getElementById('myMessage').value);
}

function timeAgo(time) {
    var date = new Date((time || "").toString().replace(/-/g, "/").replace(/[TZ]/g, " ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);

    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) {
        console.log("🚀 ~ file: feeds.js ~ line 379 ~ timeAgo ~ day_diff", day_diff)
        return;
    }

    return day_diff == 0 && (
            diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor(diff / 3600) + " hours ago") ||
        day_diff == 1 && "Yesterday" ||
        day_diff < 7 && day_diff + " days ago" ||
        day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
}


let myDropzone = new Dropzone("#myDropzone", {
    init: function() {
        dz = this;
        document.getElementById("newFeed-upload-btn").addEventListener("click", function handler(e) {
            e.preventDefault();
            dz.processQueue();
        });
        this.on("success", async function(file, responseText) {
            imagePath = responseText.imgPath
        });
        this.on("queuecomplete", async function(file) {
            socket.emit("newFeed", { imagePath: imagePath, content: document.getElementById("newFeed-content").value });
            socket.on("newFeedError", (reason) => {
                alertMini.fire({
                    icon: 'error',
                    title: 'Failed to create feed.'
                })
            });
            socket.on("newFeedSuccess", async(reason) => {
                document.getElementById("newFeed-content").value = "";
                this.removeAllFiles(true);
                alertMini.fire({
                    icon: 'success',
                    title: 'Successfully created the feed.'
                })
            });

        });

    },

    url: "/feeds/upload",
    autoProcessQueue: false,
    addRemoveLinks: true,
    uploadMultiple: true,
    parallelUploads: 30,
    paramName: "file",
    maxFilesize: 3,
    acceptedFiles: "image/*",
    maxFiles: 3,
    dictDefaultMessage: `Drop files here or click to upload.`,
    dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
    dictInvalidFileType: "You can't upload files of this type.",
    dictFileTooBig: "File is too big {{filesize}}. Max filesize: {{maxFilesize}}MiB.",
    dictResponseError: "Server error: {{statusCode}}",
    dictMaxFilesExceeded: "You can't upload any more files.",
    dictCancelUpload: "Cancel upload",
    dictRemoveFile: "Remove file",
    dictCancelUploadConfirmation: "You really want to delete this file?",
    dictUploadCanceled: "Upload canceled",
});

var newFeed_upload_btn = document.getElementById("newFeed-upload-btn")
var newFeed_content = document.getElementById("newFeed")
newFeed_content.addEventListener('mouseover', async() => {
    document.getElementById("myDropzone").classList.remove("d-none");
    document.getElementById("myDropzone").classList.add("d-block");
    document.getElementById("newFeed-upload-btn").classList.add("d-block");
    document.getElementById("newFeed-upload-btn").classList.remove("d-none");
})
newFeed_content.addEventListener('mouseout', async() => {
        document.getElementById("myDropzone").classList.remove("d-block")
        document.getElementById("myDropzone").classList.add("d-none");
        document.getElementById("newFeed-upload-btn").classList.remove("d-block")
        document.getElementById("newFeed-upload-btn").classList.add("d-none");
    })
    // end newfeed


socket.on("connect", async(msg) => {
    console.log(socket.id)
});

socket.on("disconnect", async(reason) => {
    if (reason === "io server disconnect") {
        socket.connect();
    }
});

socket.on("connect_error", async() => {
    setTimeout(() => {
        socket.connect();
    }, 1000);
});

socket.on('message', async(msg) => {
    alertMini.fire({
        text: `Received message : ${msg}`
    })
});

json = {
    "id": 2,
    "content": "Color",
    "img1": "\"feeds/9b5111f1-b122-4b7a-b74b-c5750d60d888.png,feeds/3e379931-8957-4da8-b7b6-5ee914c23b5b.png,\"",
    "created_at": {
        "$date": "2022-03-09T15:24:10Z"
    },
    "user_id": 1,
    "like": [],
    "comment": [{
        "id": 1,
        "created_at": {
            "$date": "2022-03-09T17:27:10Z"
        },
        "feed_id": 2,
        "user_id": 1,
        "content": "test",
        "user": {
            "id": 1,
            "profile": "profile/36e17689-1275-4522-a405-b3f066519381.jpg",
            "fullName": "test1@gmail.com",
            "email": "test1@gmail.com",
            "socket_id": null
        }
    }],
    "user": {
        "id": 1,
        "profile": "profile/36e17689-1275-4522-a405-b3f066519381.jpg",
        "fullName": "test1@gmail.com",
        "email": "test1@gmail.com",
        "socket_id": null
    },
    "target": {}
}



class FeedsOrganize {
    constructor() {
        this.feeds = []
        this.queue = []
        this.container = document.getElementById("feeds")
        this.htmlTemp = ``
    }

    add(data) {
        for (let i = 0; i < data.length; i++) {
            this.queue.push(data[i])
        }
        console.log("🚀 ~ file: feeds.js ~ line 514 ~ FeedsOrganize ~ add ~ this.queue", this.queue)
    }



    formatImgData(str) {
        let data = [];
        let arr1 = str.split("\"");
        for (let j = 0; j < arr1.length; j++) {
            if (arr1[j] !== '') {
                let arr2 = arr1[j].split(",");
                for (let k = 0; k < arr2.length; k++) {
                    if (arr2[k] !== '') {
                        data.push(arr2[k])
                    }
                }
            }
        }
        return data
    }
    createImage(data, count) {
        let html = ''
        if (count < 1) {
            html = `<div class="carousel-item active">
            <img src="/api/image?file=${data}" class="d-block w-100 animate__animated animate__fadeIn" alt="...">
        </div>`
            return html
        } else {
            html = `<div class="carousel-item ">
            <img src="/api/image?file=${data}" class="d-block w-100 animate__animated animate__fadeIn" alt="...">
        </div>`
            return html
        }

    }


    createImages(data) {
        let count = 0
        let html = `<div class="feedImg">
            <div id="feed_${data.id}_image" class="carousel slide" data-bs-interval="false" data-bs-ride="carousel">
                <div class="carousel-inner">`;
        let image = this.formatImgData(data.img1);
        for (let i = 0; i < image.length; i++) {
            html += this.createImage(image[i], count)
            count += 1
        }

        html += `</div>
        <button class="carousel-control-prev" type="button" data-bs-target="#feed_${data.id}_image" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#feed_${data.id}_image" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
    </div>
</div>`;
        return html
    }

    createComment(data) {
        let html = ''
        if (data !== undefined) {
            html = `
        <div class="feedComment">
        <div class="img">
            <img class="img" src="/api/profile?file=${data.user.profile}" alt="">
        </div>
        <div class="text">
            <div class="profile">
                <div class="name">
                    ${data.user.fullName}
                </div>
                <div class="dateTime">
                    5 hours ago
                </div>
            </div>
            <div class="content">
            ${data.content}
            </div>
        </div>
    </div>
        `
            return html
        } else {
            return html
        }




    }

    createFooter(data) {
        let html = `
        <div class="feedFooter">
            <div class="love-count">
                <i class="bi bi-suit-heart-fill"></i>
                <div id="count_like">${data.like.length}</div>
            </div>

            <div class="comment-count">
                <i class="bi bi-chat-fill"></i>
                <div id="count_comtent">${data.comment.length}</div>
            </div>
        </div>`
        return html

    }

    createComments(data) {
        let html = ''
        if (data.comment.length > 0) {
            html = `<div class="feedComments">`;
            for (let i = 0; i < data.comment.length; i++) {
                html += this.createComment(data.comment[i])
            }
            html += `</div>`;

            return html
        } else {
            return html
        }


    }

    createCard(data) {
        console.log("🚀 ~ file: feeds.js ~ line 577 ~ FeedsOrganize ~ createCard ~ data", data)
        let card = document.createElement('div')
        card.setAttribute('id', `feed_id_${data.id}`)
        let feedHead = `
                    <div class="feed" id="feed_id_${data.id}">
                <div class="feedHead">
                    <div class="img">
                        <img class="img" src="/api/profile?file=${data.user.profile}" alt="">
                    </div>
                    <div class="text">
                        <div class="name">
                            ${data.user.fullName}
                        </div>
                        <div class="dateTime" id="feed_${data.id}_time">
                            
                        </div>
                    </div>
                    <div class="action">
                        <button class="feed-action"><i class="bi bi-three-dots"></i></button>
                    </div>
                </div>
                <div class="feedContent">
                ${data.content}
                </div>
                `
        let feedImage = this.createImages(data)
        let footer = this.createFooter(data)
        let comment = this.createComments(data)
        let mycomment = this.createMyComment(data)

        let end = `</div>`
        card.innerHTML = feedHead + feedImage + footer + comment + mycomment + end

        return card

    }


    createMyComment(data) {
        let html = `        <div class="comment">
        <div class="img">
            <img class="img" src="/api/profile?file=${profile.profile}" alt="">
        </div>
        <div class="user-input-comment">
            <textarea name="feed_${data.id}_inputComment" class="" id="feed_${data.id}_inputComment" placeholder="Write a comment..."></textarea>
        </div>
        <div class="action">
            <button class="feed-action" onClick="Comment(${data.id});">Submit</button>
        </div>
    </div>`
        return html
    }

    createElement(data) {
        this.container.appendChild(this.createCard(data))
        let dom = document.getElementById(`feed_${data.id}_time`)
        timeago.render(dom, 'en_US', data.created_at)
    }

    Ensure(data) {
        if (this.feeds.length < 1 || this.feeds.filter(feed => feed.id == data.id).length < 1) {
            return true
        }
    }

    createFeed(data) {
        let temp = data
        temp['target'] = document.getElementById(`feed_id_${data.id}`)
        this.feeds.push(temp)
        console.log("🚀 ~ file: feeds.js ~ line 631 ~ FeedsOrganize ~ createFeed ~ this.feeds", this.feeds)

    }

    Organize() {
        for (let i = 0; i < this.queue.length; i++) {
            console.log("🚀 ~ file: feeds.js ~ line 630 ~ FeedsOrganize ~ Organize ~ i", i)
            let data = this.queue[i]
            if (this.Ensure(data)) {
                this.createElement(data)
                this.createFeed(data)
            }
        }
        this.queue = []
    }

    async Execute() {
        await this.removeChild()
        await this.Organize()
    }

    removeChild() {
        if (this.feeds.length < 1) {
            if (this.container.children.length > 0) {
                let len = this.container.children.length
                for (let i = 0; i < len; i++) {
                    this.container.removeChild(this.container.children[0]);
                }
            }
        }

    }

}

var feedsOrganize = new FeedsOrganize();

async function Comment(id) {
    let content = await document.getElementById(`feed_${id}_inputComment`).value
    console.log(content)
    await socket.emit("comment", {
        feed_id: id,
        content: content
    });
}
socket.on('feeds', async(msg) => {
    await feedsOrganize.add(msg)
    await feedsOrganize.Execute()
});


socket.on("commentSuccess", async(reason) => {
    document.getElementById(`feed_${reason.feed_id}_inputComment`).value = ''
    alertMini.fire({
        icon: 'success',
        title: 'Successfully comment.'
    });


});
socket.on("commentError", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to comment.'
    });
});

socket.on('profile', async(msg) => {
    profile.fullName = msg.fullName
    profile.email = msg.email
    profile.profile = msg.profile
});

socket.on('follower', async(msg) => {
    alertMini.fire({
        text: `${msg}`
    })
});

socket.on('Accept', async(msg) => {
    alertMini.fire({
        text: `${msg}`
    })
});

socket.on("newFollowError", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to Follow.'
    });
});

socket.on("newFollowSuccess", async(reason) => {
    alertMini.fire({
        icon: 'success',
        title: 'Successfully Follow.'
    });
});
socket.on("newAcceptError", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to Accept.'
    });
});

socket.on("newAcceptSuccess", async(reason) => {
    alertMini.fire({
        icon: 'success',
        title: 'Successfully Accept.'
    });
});


socket.on('friend_recommend', async(msg) => {
    await FriendRecomOrganize.addFriends(msg);
    await FriendRecomOrganize.Organize();
});

socket.on('friend_recommend_interrupt', async(msg) => {
    await FriendRecomOrganize.Interrupt(msg);
});

socket.on('friend_Required', async(msg) => {
    await FriendReqOrganize.addFriends(msg);
    await FriendReqOrganize.Organize();
});

socket.on('friend_Required_interrupt', async(msg) => {
    await FriendReqOrganize.Interrupt(msg);
});

socket.on('concacts', async(msg) => {
    await FriendConOrganize.addFriends(msg);
    await FriendConOrganize.Organize();
});

socket.on('concacts_interrupt', async(msg) => {
    await FriendConOrganize.Interrupt(msg);
});