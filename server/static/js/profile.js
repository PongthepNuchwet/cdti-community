let parser = document.createElement('a');
parser.href = document.URL
var id = parser.pathname.split("/").slice(-1)[0]
console.log("uid", id)

var feeds = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/feeds', { query: `page=profile&uid=${id}` });

document.getElementById('btn_profile').addEventListener("click", function() {
    document.location = `/profile/${id}`
});
document.getElementById('btn_follower').addEventListener("click", function() {
    document.location = `/profile/${id}/follower`
});
document.getElementById('btn_following').addEventListener("click", function() {
    document.location = `/profile/${id}/following`
});


async function love(id) {
    feeds.emit("love", {
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
class FeedsOrganize {
    constructor() {
        this.feeds = []
        this.queue = []
        this.container = document.getElementById("feeds")
        this.htmlTemp = ``
    }

    report(text, feed_id) {
        if (text !== '') {
            feeds.emit("report", {
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
        feeds.emit("delete_comment", {
            feed_id: feed_id,
            id: id
        });
    }
    delete_feed(feed_id) {
        console.log("🚀 ~ file: feeds.js ~ line 706 ~ FeedsOrganize ~ delete_feed ~ feed_id", feed_id)
        feeds.emit("delete_feed", {
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
        feeds.emit("moreComment", {
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
                <img src="${data}" class="d-block w-100 animate__animated animate__fadeIn" alt="...">
            </div>`
            return html
        } else {
            html = `<div class="carousel-item ">
                <img src="${data}" class="d-block w-100 animate__animated animate__fadeIn" alt="...">
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
            <img class="img" src="${data.user.profile}" alt="">
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
            <img class="img" src="${data.user.profile}" alt="">
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
            <img class="img" src="${profile.profile}" alt="">
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

class Profile {
    constructor() {
        this.fullName = ''
        this.email = ''
        this.profile = ''
    }
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

var feedsOrganize = new FeedsOrganize();
var profile = new Profile();

feeds.on("connect", async(msg) => {
    console.log("sid", feeds.id)
});

feeds.on("disconnect", async(reason) => {
    if (reason === "io server disconnect") {
        feeds.connect();
    }
});

feeds.on("connect_error", async() => {
    setTimeout(() => {
        feeds.connect();
    }, 1000);
});

feeds.on('message', async(msg) => {
    alertMini.fire({
        text: `Received message : ${msg}`
    })
});

feeds.on('profile', async(msg) => {
    console.log("🚀 ~ file: profile.js ~ line 32 ~ feeds.on ~ msg", msg)
    profile.fullName = msg.fullName
    profile.email = msg.email
    profile.profile = msg.profile
    document.getElementById("name").innerHTML = profile.fullName
    document.getElementById("email").innerHTML = profile.email
    document.getElementById("image").setAttribute('src', '' + profile.profile)
});
feeds.on('profile_notFound', async(msg) => {
    console.log("profile_notFound")
        // profile.fullName = msg.fullName
        // profile.email = msg.email
        // profile.profile = msg.profile
});

feeds.on('feeds', async(msg) => {
    console.log("🚀 ~ file: profile.js ~ line 45 ~ feeds.on ~ msg", msg)
    await feedsOrganize.add(msg)
    await feedsOrganize.Execute()
});

feeds.on('ban', async(msg) => {
    console.log("ban")
});

async function Comment(id) {
    let content = await document.getElementById(`feed_${id}_inputComment`).value
    console.log(content, content.length)

    if (content.length > 0) {
        await feeds.emit("comment", {
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
feeds.on('feeds', async(msg) => {
    await feedsOrganize.add(msg)
    await feedsOrganize.Execute()
});
feeds.on('report_error', async(msg) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to report'
    });
});
feeds.on('report_success', async(msg) => {
    alertMini.fire({
        icon: 'success',
        title: 'Successfully report.'
    });
});
feeds.on('delete_feed_success', async(msg) => {
    console.log("🚀 ~ file: feeds.js ~ line 1133 ~ feeds.on ~ msg", msg)
    feedsOrganize.delete_feed_success(msg)
    alertMini.fire({
        icon: 'success',
        title: 'Successfully delete.'
    });
});
feeds.on('delete_feed_error', async(msg) => {
    console.log("🚀 ~ file: feeds.js ~ line 1140 ~ feeds.on ~ msg", msg)
    alertMini.fire({
        icon: 'error',
        title: 'Failed to delete.'
    });
});

feeds.on('delete_comment_error', async(msg) => {
    console.log("🚀 ~ file: feeds.js ~ line 1147 ~ feeds.on ~ msg", msg)
    alertMini.fire({
        icon: 'error',
        title: msg['msg']
    });
});

feeds.on('delete_comment_success', async(msg) => {
    feedsOrganize.delete_comment_success(msg)
    alertMini.fire({
        icon: 'success',
        title: 'Deleted!. Your comment has been deleted.'
    })
});


feeds.on("commentSuccess", async(reason) => {
    console.log(reason)
    feedsOrganize.interruptComment(reason.comment)
    document.getElementById(`feed_${reason.feed_id}_inputComment`).value = ''

    alertMini.fire({
        icon: 'success',
        title: 'Successfully comment.'
    });


});

feeds.on("moreComment", async(reason) => {
    feedsOrganize.More_comment_set(reason)
});

feeds.on("love", async(reason) => {
    feedsOrganize.love(reason)
});
feeds.on("commentError", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to comment.'
    });
});