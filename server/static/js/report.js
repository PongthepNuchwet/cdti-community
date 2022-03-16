var report = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/report');

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

report.on("connect", async(msg) => {
    console.log(report.id)
});

report.on("disconnect", async(reason) => {
    if (reason === "io server disconnect") {
        report.connect();
    }
});

report.on("connect_error", async() => {
    setTimeout(() => {
        report.connect();
    }, 1000);
});

report.on('message', async(msg) => {
    alertMini.fire({
        text: `Received message : ${msg}`
    })
});

function Open(id) {
    console.log("🚀 ~ file: report.js ~ line 66 ~ Open ~ id", id)
    reportOrganize.Open(id)
}

function Ban(id) {
    reportOrganize.ban(id)
}

function Unban(id) {
    reportOrganize.unBan(id)
}

class Report {
    constructor() {
        this.reports = []
        this.h_report_container = document.getElementById('h-reports')
        this.user_email = document.getElementById("user_email")
        this.content = document.getElementById("content")
        this.time = document.getElementById("time")
        this.elm_ban = document.getElementById('ban')
        this.elm_input = document.getElementById('input')
        this.appeal = document.getElementById('appeal')
        this.temp_highlight
    }

    highlight(elm) {
        if (this.temp_highlight !== undefined) {
            this.temp_highlight.classList.remove('open')
            this.temp_highlight = elm
            this.temp_highlight.classList.add('open')
        } else {
            this.temp_highlight = elm
            this.temp_highlight.classList.add('open')
        }
    }


    createNone() {
        let elm = document.createElement('div')
        elm.setAttribute('class', `h-none`)
        elm.innerHTML = 'None'
        this.h_report_container.appendChild(elm)
    }

    NotFound() {
        this.removeChild()
        this.elm_ban.disabled = true
        this.elm_input.disabled = true
        this.user_email = document.getElementById("user_email").innerHTML = '-'
        this.content = document.getElementById("content").innerHTML = '-'
        this.createNone()
    }
    find_report_index(id) {
        return this.reports.findIndex(report => report.id == id)
    }

    add(data) {
        if (data.length > 0) {
            for (let i = 0; i <= data.length - 1; i++) {
                this.reports.push(data[i])
            }
        }
        console.log("🚀 ~ file: report.js ~ line 67 ~ Report ~ constructor ~ this.reports", this.reports)
    }

    createElement(data) {
        let elm = document.createElement('button')
        elm.setAttribute('class', `h-report`)
        elm.setAttribute('id', `h_report_${data.id}`)
        elm.setAttribute('onClick', `Open(${data.id})`)

        // elm.addEventListener("click", function() {
        //     reportOrganize.open(data.id)
        // });
        if (data.status_admin == '0') {
            elm.classList.add('active')
        }
        let html = `<div class="row">
        <div class="col-8" id="">
            ${data.user.fullName} ${data.user.email}
        </div>
        <div class="col-4 ">
            ${data.created_at.$date}
        </div>
    </div>`
        elm.innerHTML = html
        return elm

    }

    Organize() {
        this.removeChild()
        console.log("🚀 ~ file: report.js ~ line 98 ~ Report ~ Organize ~ this.h_report_container", this.h_report_container)
        if (this.reports.length > 0) {
            for (let i = 0; i <= this.reports.length - 1; i++) {
                let report = this.createElement(this.reports[i])

                this.h_report_container.appendChild(report)
            }
        }
    }

    removeChild() {
        console.log("removeChild")
        if (this.h_report_container.children.length > 0) {
            let len = this.h_report_container.children.length
            for (let i = 0; i < len; i++) {
                this.h_report_container.removeChild(this.h_report_container.children[0]);
            }
        }
    }

    Open(id) {
        report.emit("open", {
            id: id,
        });

        this.elm_ban.disabled = false
        this.elm_input.disabled = false
        let list = document.getElementById(`h_report_${id}`)
        this.highlight(list)

        let index = this.find_report_index(id)
        console.log("🚀 ~ file: report.js ~ line 180 ~ Report ~ Open ~ index", index)
        let data = this.reports[index]
        console.log("🚀 ~ file: report.js ~ line 182 ~ Report ~ Open ~ data", data)
        console.log("🚀 ~ file: report.js ~ line 186 ~ Report ~ Open ~ data.feed.user.status", data.feed[0].user.status)

        if (data.feed[0].user.status == 0) {
            this.elm_ban.innerHTML = 'Ban'
            this.elm_ban.classList.remove('Unban')
            this.elm_ban.classList.add('ban')
            this.elm_ban.setAttribute('onClick', `Ban(${id})`)
        } else {
            this.elm_ban.classList.remove('ban')
            this.elm_ban.classList.add('Unban')
            this.elm_ban.innerHTML = 'Un Ban'
            this.elm_ban.setAttribute('onClick', `Unban(${id})`)
        }

        if (data.status_admin == '0') {
            list.classList.remove('active')
        }

        this.user_email.innerHTML = data.user.email
        this.content.innerHTML = data.content_user
        this.time.innerHTML = data.created_at.$date
        if (data.content_appeal != null) {
            this.appeal.innerHTML = data.content_appeal
        } else {
            this.appeal.innerHTML = '-'
        }

        feedsOrganize.add(data)
        feedsOrganize.Execute()
    }

    ban_success(id) {
        this.elm_input.value = ''
        this.elm_ban.innerHTML = 'Un Ban'
        this.elm_ban.classList.remove('ban')
        this.elm_ban.classList.add('Unban')
            // this.elm_ban.addEventListener("click", function() {
            //     reportOrganize.unBan(id)
            // });
        this.elm_ban.setAttribute('onClick', `Unban(${id})`)

    }
    unBan_success(id) {
        this.elm_input.value = ''
        this.elm_ban.innerHTML = 'Ban'
        this.elm_ban.classList.remove('Unban')
        this.elm_ban.classList.add('ban')
            // this.elm_ban.addEventListener("click", function() {
            //     reportOrganize.ban(id)
            // });
        this.elm_ban.setAttribute('onClick', `Ban(${id})`)
    }


    ban(id) {
        let index = this.find_report_index(id)
        let val = this.elm_input.value
        let user_id = this.reports[index].feed[0].user.id

        for (let i = 0; i <= this.reports.length - 1; i++) {
            if (this.reports[i].feed[0].user.id == user_id) {
                this.reports[i].user.status = "2"
            }
        }

        report.emit("ban", {
            id: id,
            content: val,
            user_id: user_id
        });
    }
    unBan(id) {
        let index = this.find_report_index(id)
        let val = this.elm_input.value
        let user_id = this.reports[index].feed[0].user.id

        for (let i = 0; i <= this.reports.length - 1; i++) {
            if (this.reports[i].feed[0].user.id == user_id) {
                this.reports[i].user.status = "0"
            }
        }
        report.emit("unBan", {
            id: id,
            content: val,
            user_id: user_id
        });
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


class FeedsOrganize {
    constructor() {
        this.feeds = []
        this.queue = []
        this.container = document.getElementById("feeds")
        this.htmlTemp = ``
    }

    find_feed_index(id) {
        return this.feeds.findIndex(feed => feed.id == id)
    }
    find_like_index(feed_index, feed_id, uid) {
        return this.feeds[feed_index].like.findIndex(like => like.user_id == uid && like.feed_id == feed_id)
    }


    add(data) {
        console.log("🚀 ~ file: report.js ~ line 245 ~ FeedsOrganize ~ add ~ data.length", data.length)
        this.feeds = []
        this.queue = []
        this.queue.push(data)
        console.log("🚀 ~ file: report.js ~ line 246 ~ FeedsOrganize ~ add ~ this.queue", this.queue)
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
        let count = 0
        let html = `
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
    </div>`;
        elm.innerHTML = html
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
            // let action = this.createAction(data)
            // let footer = this.createFooter(data)

        card.appendChild(header)
        card.appendChild(content)
        card.appendChild(feedImage)
        card.appendChild(count)
            // card.appendChild(action)
            // card.appendChild(footer)
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
        this.container.appendChild(this.createCard(data.feed[0]))
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
                if (this.feeds.length > 0) {
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
var reportOrganize = new Report();
var feedsOrganize = new FeedsOrganize();



report.on('report', async(msg) => {
    console.log("report", msg)
    reportOrganize.add(msg)
    reportOrganize.Organize()
});
report.on('reportNotFound', async(msg) => {
    reportOrganize.NotFound()
    console.log("reportNotFound", msg)
});

report.on("ban_error", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to ban.'
    });
});

report.on("ban_success", async(reason) => {
    reportOrganize.ban_success(reason.id)
    alertMini.fire({
        icon: 'success',
        title: 'Successfully ban.'
    });
});

report.on("unBan_error", async(reason) => {
    alertMini.fire({
        icon: 'error',
        title: 'Failed to unBan.'
    });
});

report.on("unBan_success", async(reason) => {
    reportOrganize.unBan_success(reason.id)
    alertMini.fire({
        icon: 'success',
        title: 'Successfully unBan.'
    });
});