Dropzone.autoDiscover = false;
document.addEventListener('scroll', function(e) {
    if (window.scrollY == 0) {
        console.log("top");
    } else if (window.scrollY >= document.documentElement.scrollHeight - document.documentElement.clientHeight) {
        console.log("end");
    }
});
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/feeds', { query: 'page=feeds' });


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

var mySwal = Swal.mixin({
    customClass: {
        container: 'mySwal',
        popup: 'mySwal_popup',
        header: '',
        title: 'mySwal_title',
        closeButton: '',
        icon: '',
        image: '',
        content: 'mySwal_content',
        htmlContainer: '',
        input: '',
        inputLabel: '',
        validationMessage: '',
        actions: '',
        confirmButton: 'mySwal_confirm',
        denyButton: '',
        cancelButton: 'mySwal_cancel ms-2',
        loader: '',
        footer: '',
        timerProgressBar: '',
    },
    buttonsStyling: false
})


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

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];


function getFormattedDate(date, prefomattedDate = false, hideYear = false) {
    const day = date.getDate();
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    let minutes = date.getMinutes();

    if (minutes < 10) {
        // Adding leading zero to minutes
        minutes = `0${ minutes }`;
    }

    if (prefomattedDate) {
        // Today at 10:20
        // Yesterday at 10:20
        return `${ prefomattedDate } at ${ hours }:${ minutes }`;
    }

    if (hideYear) {
        // 10. January at 10:20
        return `${ day }. ${ month } at ${ hours }:${ minutes }`;
    }

    // 10. January 2017. at 10:20
    return `${ day }. ${ month } ${ year }. at ${ hours }:${ minutes }`;
}


// --- Main function
function timeAgo(dateParam) {
    if (!dateParam) {
        return null;
    }

    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
    const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
    const today = new Date();
    const yesterday = new Date(today - DAY_IN_MS);
    const seconds = Math.round((today - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const isToday = today.toDateString() === date.toDateString();
    const isYesterday = yesterday.toDateString() === date.toDateString();
    const isThisYear = today.getFullYear() === date.getFullYear();


    if (seconds < 5) {
        return 'now';
    } else if (seconds < 60) {
        return `${ seconds } seconds ago`;
    } else if (seconds < 90) {
        return 'about a minute ago';
    } else if (minutes < 60) {
        return `${ minutes } minutes ago`;
    } else if (isToday) {
        return getFormattedDate(date, 'Today'); // Today at 10:20
    } else if (isYesterday) {
        return getFormattedDate(date, 'Yesterday'); // Yesterday at 10:20
    } else if (isThisYear) {
        return getFormattedDate(date, false, true); // 10. January at 10:20
    }

    return getFormattedDate(date); // 10. January 2017. at 10:20
}

socket.on("newFeedError", (reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to create feed.'
    })
});
socket.on("newFeedSuccess", async(reason) => {
    let target = document.getElementById('newFeed-upload-btn')
    console.log("🚀 ~ file: feeds.js ~ line 508 ~ socket.on ~ reason newFeedSuccess", reason)
    target.innerHTML = `<i class="bi bi-link-45deg"></i> Post It.`
    document.getElementById("newFeed-content").value = "";
    myDropzone.removeAllFiles(true);
    feedsOrganize.feedsInterrup(reason, 'top')
    alertMini.fire({
        icon: 'success',
        title: 'Successfully created the feed.'
    })
});

let myDropzone = new Dropzone("#myDropzone", {
    init: function() {
        dz = this;
        let target = document.getElementById('newFeed-upload-btn')
        document.getElementById("newFeed-upload-btn").addEventListener("click", function handler(e) {
            e.preventDefault();
            target.innerHTML = `<div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>`
            console.log("newFeed-upload-btn", myDropzone.files.length)
            if (myDropzone.files.length > 0) {
                dz.processQueue();
            } else {
                socket.emit("newFeed", { imagePath: '', content: document.getElementById("newFeed-content").value });
            }


        });
        this.on("success", async function(file, responseText) {
            imagePath = responseText.imgPath
            console.log("🚀 ~ file: feeds.js ~ line 497 ~ this.on ~ responseText.imgPath", responseText.imgPath)
        });
        this.on("queuecomplete", async function(file) {
            socket.emit("newFeed", { imagePath: imagePath, content: document.getElementById("newFeed-content").value });


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

async function love(id) {
    socket.emit("love", {
        feed_id: id,
    });
}



async function DeleteComment(feed_id, id) {
    mySwal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            feedsOrganize.delete_comment(feed_id, id)

        }
    })
}

async function more_comment(id) {
    feedsOrganize.More_comment(id)
}

async function showFooter(id) {
    document.getElementById(`feed_${id}_footer`).classList.remove("d-none");
    document.getElementById(`feed_${id}_footer`).classList.add("d-block");
    let elm = document.getElementById(`feed_${id}_btn_showFooter`)
    elm.setAttribute('onClick', `unShowFooter(${id});`)
}
async function unShowFooter(id) {
    document.getElementById(`feed_${id}_footer`).classList.remove("d-block");
    document.getElementById(`feed_${id}_footer`).classList.add("d-none");
    let elm = document.getElementById(`feed_${id}_btn_showFooter`)
    elm.setAttribute('onClick', `showFooter(${id});`)
}

async function report(id) {
    const { value: text } = await mySwal.fire({
        input: 'textarea',
        inputLabel: 'Report',
        inputPlaceholder: 'Type your message here...',
        inputAttributes: {
            'aria-label': 'Type your message here'
        },
        showCancelButton: true,
        confirmButtonText: "report"
    })

    if (text) {
        feedsOrganize.report(text, id);
    }

}
async function feed_delete(id) {
    mySwal.fire({
        title: 'Are you sure you want to delete this post?',
        text: "You won't be able to revert this!",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            feedsOrganize.delete_feed(id)
            console.log("🚀 ~ file: feeds.js ~ line 636 ~ feed_delete ~ id", id)
        }
    })
}

async function feed_option(id) {
    mySwal.fire({
        title: '<strong>Option</strong>',
        html: `<div class="feed-option">
        <button onclick="report('${id}');" class='report'>Report</button>
        <button onclick="feed_delete('${id}');" class='delete'>Delete</button>
    </div>`,
        showCloseButton: false,
        showCancelButton: false,
        focusConfirm: false,
        showConfirmButton: false,
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
        confirmButtonAriaLabel: 'Thumbs up, great!',
        cancelButtonText: '<i class="fa fa-thumbs-down"></i>',
        cancelButtonAriaLabel: 'Thumbs down'
    })

}

class FeedsOrganize {
    constructor() {
        this.feeds = []
        this.queue = []
        this.container = document.getElementById("feeds")
        this.htmlTemp = ``
    }

    report(text, feed_id) {
        if (text !== '') {
            socket.emit("report", {
                feed_id: feed_id,
                text: text
            });
        }
    }

    delete_comment_success(msg) {
        let parent = document.getElementById(`feed_${msg.comment.feed_id}_coments`)
        let child = document.getElementById(`feed_${msg.comment.feed_id}_comment_${msg.comment.id}`)
        parent.removeChild(child);
        let index = this.find_feed_index(msg.comment.feed_id)
        this.feeds[index].comment_count -= 1
        this.updateFeedCount(msg.comment.feed_id)
        alertMini.fire({
            icon: 'success',
            title: 'Successfully delete comment.'
        });
    }

    async delete_feed_success(msg) {
        let index = await this.find_feed_index(msg['feed_id'])
        console.log("🚀 ~ file: feeds.js ~ line 691 ~ FeedsOrganize ~ delete_feed_success ~ index", index)
        let child = document.getElementById(`feed_id_${msg.feed_id}`)
        console.log("🚀 ~ file: feeds.js ~ line 693 ~ FeedsOrganize ~ delete_feed_success ~ child", child)
        this.feeds.splice(index)
        this.container.removeChild(child)
    }

    delete_comment(feed_id, id) {
        socket.emit("delete_comment", {
            feed_id: feed_id,
            id: id
        });
    }
    delete_feed(feed_id) {
        console.log("🚀 ~ file: feeds.js ~ line 706 ~ FeedsOrganize ~ delete_feed ~ feed_id", feed_id)
        socket.emit("delete_feed", {
            feed_id: feed_id,
        });
    }

    async love(res) {
        let feed_index = await this.find_feed_index(res.feed_id);
        let parent = await document.getElementById(`feed_${res.feed_id}_btn_love`)
        if (res.status == 'love') {
            this.feeds[feed_index].like.push(res.like)
            this.feeds[feed_index].like_count += 1
            parent.classList.add('action')
            parent.innerHTML = `<i class="bi bi-heart-fill"></i> I love it`
        } else {
            let like_index = await this.find_like_index(feed_index, res.feed_id, res.user_id);
            let remove = await this.feeds[feed_index].like.splice(like_index)
            this.feeds[feed_index].like_count -= 1
            parent.classList.remove('action')
            parent.innerHTML = `<i class="bi bi-heart"></i> I love it`
        }
        this.updateFeedCount(res.feed_id)

    }

    find_feed_index(id) {
        return this.feeds.findIndex(feed => feed.id == id)
    }
    find_like_index(feed_index, feed_id, uid) {
        return this.feeds[feed_index].like.findIndex(like => like.user_id == uid && like.feed_id == feed_id)
    }

    get_id_comment(feed_id) {
        let index = this.feeds.findIndex(feed => feed.id == feed_id)
        let data = this.feeds[index].comment.map(comment => comment.id)
        return data
    }

    More_comment(id) {
        socket.emit("moreComment", {
            feed_id: id,
            comment_ids: this.get_id_comment(id)
        });
    }
    More_comment_set(res) {
        let index = this.find_feed_index(res.feed_id)
        let parent = document.getElementById(`feed_${res.feed_id}_coments`)
        for (let i = 0; i < res.comment.length; i++) {
            this.feeds[index].comment.push(res.comment[i])
            let comment = this.createComment(res.comment[i])
            parent.appendChild(comment)
        }

    }

    add(data) {
        console.log("🚀 ~ file: feeds.js ~ line 780 ~ FeedsOrganize ~ add ~ data", data)
        for (let i = 0; i < data.length; i++) {
            this.queue.push(data[i])
        }
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
        let elm = document.createElement('div')
        elm.setAttribute('class', `feedImg`)
        let image = this.formatImgData(data.img1);
        console.log("🚀 ~ file: feeds.js ~ line 818 ~ FeedsOrganize ~ createImages ~ image.length", image.length, data.img1)

        if (image.length > 0) {
            let count = 0
            let html = `
                <div id="feed_${data.id}_image" class="carousel slide" data-bs-interval="false" data-bs-ride="carousel">
                    <div class="carousel-inner">`;
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
        </div>`;
            elm.innerHTML = html
        }
        return elm
    }

    EnsureLike(data) {
        let ensure = data.like.filter(like => like.user.email == profile.email)
        if (ensure.length > 0) {
            return true
        } else {
            return false
        }
    }

    createAction(data) {
        let elm = document.createElement('div')
        elm.setAttribute('class', `feedAction`)
        let html = ''
        if (this.EnsureLike(data)) {
            html += `<div>
                <button onClick="love(${data.id});" class="action" id="feed_${data.id}_btn_love"><i class="bi bi-heart-fill"></i> I love it</button>
            </div>`
        } else {
            html += `<div>
                <button onClick="love(${data.id});" class="" id="feed_${data.id}_btn_love"><i class="bi bi-heart"></i> I love it</button>
            </div>`
        }

        html += `
            <div>
                <button onClick=showFooter(${data.id}); id='feed_${data.id}_btn_showFooter'><i class="bi bi-chat"></i> comment</button>
            </div>
        `
        elm.innerHTML = html
        return elm
    }

    updateFeedCount(id) {
        let index = this.feeds.findIndex(feed => feed.id == id);
        let loveCount = this.feeds[index].like_count
        let commentCount = this.feeds[index].comment_count
        let love = document.getElementById(`feed_${id}_count_love`)
        love.innerHTML = loveCount + " likes"
        let comment = document.getElementById(`feed_${id}_count_comment`)
        comment.innerHTML = commentCount + " comments"
    }

    createCount(data) {
        let elm = document.createElement('div')
        elm.setAttribute('class', `feedCount`)
        let html = `
        <span class="love-count" id="feed_${data.id}_count_love">
        ${data.like_count} likes
        </span>
        <span class="comment-count" id="feed_${data.id}_count_comment">
            ${data.comment_count} comments
        </span>
        `
        elm.innerHTML = html
        return elm
    }

    createComment(data) {
        let elm = document.createElement('div')
        elm.setAttribute('class', `feedComment `)
        elm.setAttribute('id', `feed_${data.feed_id}_comment_${data.id}`)
        let html = ''
        if (data !== undefined) {
            html = `<div class="img">
        <img class="img" src="/api/profile?file=${data.user.profile}" alt="">
    </div>
    <div class="text">
        <div class="profile">
            <div class="name">
                ${data.user.fullName}
                <span>
                ${data.content}
                </span>
            </div>
        </div>
        <div class="footer">
            <span class="timeAgo">${timeAgo(data.created_at.$date)}</span>
            `
            if (profile.email === data.user.email) {
                html += `<button onClick="DeleteComment('${data.feed_id}','${data.id}');">Delete</button>`
            }
            html += `</div>
            </div>`
            elm.innerHTML = html
            return elm
        } else {
            return elm
        }
    }

    createComments(data) {
        let elm = document.createElement('div')
        elm.setAttribute('class', `feedComments `)
        elm.setAttribute('id', `feed_${data.id}_coments`)
        let html = ''
        if (data.comment.length > 0) {
            for (let i = 0; i < data.comment.length; i++) {
                elm.appendChild(this.createComment(data.comment[i]))
            }
            return elm
        } else {
            return elm
        }
    }

    createContent(data) {
        let elm = document.createElement('div')
        elm.setAttribute('class', `feedContent `)
        elm.innerHTML = data.content
        return elm
    }

    createHeader(data) {
        let elm = document.createElement('div')
        elm.setAttribute('class', `feedHead `)
        let html = `<div class="img">
        <img class="img" src="/api/profile?file=${data.user.profile}" alt="">
    </div>
    <div class="text">
        <div class="name">
            ${data.user.fullName}
        </div>
        <div class="dateTime">
         ${timeAgo(data.created_at.$date)}
        </div>
    </div>
    <div class="action" onClick="feed_option(${data.id})">
        <button class="feed-action"><i class="bi bi-three-dots"></i></button>
    </div>`
        elm.innerHTML = html
        return elm
    }

    createFooter(data) {
        let footer = document.createElement('div')
        footer.setAttribute('class', `footer d-none`)
        footer.setAttribute('id', `feed_${data.id}_footer`)
        let comment = this.createComments(data)
        let mycomment = this.createMyComment(data)
        let MoreComment = this.createMoreComment(data)

        footer.appendChild(comment)
        footer.appendChild(MoreComment)
        footer.appendChild(mycomment)

        return footer

    }

    createMoreComment(data) {
        let elm = document.createElement('div')
        elm.setAttribute('class', `more-comment`)

        elm.innerHTML = `<button onclick="more_comment(${data.id})">View more comment</button>`


        return elm

    }

    createCard(data) {
        let card = document.createElement('div')
        card.setAttribute('id', `feed_id_${data.id}`)
        card.setAttribute('class', `feed`)

        let header = this.createHeader(data)
        let content = this.createContent(data)
        let feedImage = this.createImages(data)
        let count = this.createCount(data)
        let action = this.createAction(data)
        let footer = this.createFooter(data)

        card.appendChild(header)
        card.appendChild(content)
        card.appendChild(feedImage)
        card.appendChild(count)
        card.appendChild(action)
        card.appendChild(footer)
        return card

    }


    createMyComment(data) {
        let elm = document.createElement('div')
        elm.setAttribute('class', `comment `)
        let html = `<div class="img">
        <img class="img" src="/api/profile?file=${profile.profile}" alt="">
    </div>
    <div class="user-input-comment">
        <textarea name="feed_${data.id}_inputComment" class="" id="feed_${data.id}_inputComment" placeholder="Write a comment..."></textarea>
    </div>
    <div class="action">
        <button class="feed-action" onClick="Comment(${data.id});">Submit</button>
    </div>`
        elm.innerHTML = html
        return elm
    }

    createElement(data) {
        this.container.appendChild(this.createCard(data))
    }

    EnsureFeeds(data) {
        if (this.feeds.length < 1 || this.feeds.filter(feed => feed.id == data.id).length < 1) {
            return true
        }
    }
    EnsureComments(data) {
        let feedIndex = this.feeds.findIndex(feed => feed.id == data.feed_id)
        if (feedIndex >= 0) {
            let comment = this.feeds[feedIndex].comment.filter(comment => comment.id == data.id)
            if (comment.length < 1) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    createFeed(data) {
        let temp = data
        temp['target'] = document.getElementById(`feed_id_${data.id}`)
        this.feeds.push(temp)
    }

    Organize() {
        for (let i = 0; i < this.queue.length; i++) {
            let data = this.queue[i]
            if (this.EnsureFeeds(data)) {
                this.createElement(data)
                this.createFeed(data)
            }
        }
        this.queue = []
    }

    async feedsInterrup(data, tp) {
        for (let i = 0; i <= data.length - 1; i++) {
            let feed = await this.createCard(data[i])
            if (tp === 'top') {
                await this.feeds.splice(0, 0, data[i])
                console.log("🚀 ~ file: feeds.js ~ line 1070 ~ FeedsOrganize ~ feedsInterrup ~ this.feeds.length", this.feeds)
                console.log("🚀 ~ file: feeds.js ~ line 1070 ~ FeedsOrganize ~ feedsInterrup ~ this.feeds.length", this.feeds.length)
                console.log("🚀 ~ file: feeds.js ~ line 1072 ~ FeedsOrganize ~ feedsInterrup ~ this.container.children.length", this.container.children.length)
                if (this.container.children.length > 0) {
                    let target = await document.getElementById(`feed_id_${this.feeds[1].id}`)
                    this.container.insertBefore(feed, target)
                } else {
                    this.container.appendChild(feed)
                }
            }
        }
    }
    interruptComment(data) {

        if (this.EnsureComments(data)) {
            let feedsIndex = this.feeds.findIndex(feed => feed.id == data.feed_id)
            this.feeds[feedsIndex].comment.push(data)
            this.feeds[feedsIndex].comment_count += 1
            let target = document.getElementById(`feed_${data.feed_id}_coments`)
            let dom = this.createComment(data)
            this.updateFeedCount(data.feed_id)
            target.appendChild(dom)
        }
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
    console.log(content, content.length)

    if (content.length > 0) {
        await socket.emit("comment", {
            feed_id: id,
            content: content
        });
    } else {
        alertMini.fire({
            icon: 'warning',
            title: 'Comments are not empty.'
        });
    }

}
socket.on('feeds', async(msg) => {
    await feedsOrganize.add(msg)
    await feedsOrganize.Execute()
});
socket.on('report_error', async(msg) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to report'
    });
});
socket.on('report_success', async(msg) => {
    alertMini.fire({
        icon: 'success',
        title: 'Successfully report.'
    });
});
socket.on('delete_feed_success', async(msg) => {
    console.log("🚀 ~ file: feeds.js ~ line 1133 ~ socket.on ~ msg", msg)
    feedsOrganize.delete_feed_success(msg)
    alertMini.fire({
        icon: 'success',
        title: 'Successfully delete.'
    });
});
socket.on('delete_feed_error', async(msg) => {
    console.log("🚀 ~ file: feeds.js ~ line 1140 ~ socket.on ~ msg", msg)
    alertMini.fire({
        icon: 'error',
        title: 'Failed to delete.'
    });
});

socket.on('delete_comment_error', async(msg) => {
    console.log("🚀 ~ file: feeds.js ~ line 1147 ~ socket.on ~ msg", msg)
    alertMini.fire({
        icon: 'error',
        title: msg['msg']
    });
});

socket.on('delete_comment_success', async(msg) => {
    feedsOrganize.delete_comment_success(msg)
    alertMini.fire({
        icon: 'success',
        title: 'Deleted!. Your comment has been deleted.'
    })
});


socket.on("commentSuccess", async(reason) => {
    console.log(reason)
    feedsOrganize.interruptComment(reason.comment)
    document.getElementById(`feed_${reason.feed_id}_inputComment`).value = ''

    alertMini.fire({
        icon: 'success',
        title: 'Successfully comment.'
    });


});

socket.on("moreComment", async(reason) => {
    feedsOrganize.More_comment_set(reason)
});

socket.on("love", async(reason) => {
    feedsOrganize.love(reason)
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
socket.on('ban', async(msg) => {
    console.log("ban")
});