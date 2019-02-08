if ('serviceWorker' in navigator) {
    // navigator.serviceWorker.register('sw.js', {scope: ''}).then(function (reg) {
    //
    //     if (reg.installing) {
    //         console.log('Service worker installing');
    //     } else if (reg.waiting) {
    //         console.log('Service worker installed');
    //     } else if (reg.active) {
    //         console.log('Service worker active');
    //     }
    //
    // }).catch(function (error) {
    //     // registration failed
    //     console.log('Registration failed with ' + error);
    // });
}
const events = [
    {
        id: 1,
        name: 'Outcome',
        link: 'http://outcomeconf.com/',
        date: new Date(2019, 1, 9),
    },
    {
        id: 2,
        name: 'FrontFest',
        link: 'https://frontfest.es/',
        date: new Date(2019, 1, 9),
    },
    {
        id: 3,
        name: 'UXI Live',
        link: 'https://uxilive.co.il/2019/',
        date: new Date(2019, 1, 11),
    },
    {
        id: 4,
        name: 'Sustainable UX: design vs. climate change',
        link: 'https://sustainableux.com/',
        date: new Date(2019, 1, 12),
    },
    {
        id: 5,
        name: 'Awwwards: Digital Thinkers Conference',
        link: 'https://conference.awwwards.com/amsterdam',
        date: new Date(2019, 1, 14),
    },
]

let notifications = null

const drawList = events => {
    const eventsObj = document.getElementById('events')
    eventsObj.innerHTML = ''
    events.forEach(event => {
        const eventObj = document.createElement('div');
        eventObj.innerHTML = `
                <div class="name"> <a href='${event.link}' target='_blank'>${event.name}</a></div>
                <div class="date"> <a href='${event.link}' target='_blank'>${event.date}</a></div>
               <div class="notifies">
               <button onclick="addNotify(${event.id}, 3)">Напомнить за 3 дня</button>
               <button onclick="addNotify(${event.id}, 7)">Напомнить за 7 дней</button>
               <button onclick="addNotify(${event.id}, 14)">Напомнить за 14 дней</button>
</div>
`;
        eventsObj.appendChild(eventObj)
    })
}

const getEventById = id => events.find(event => event.id === id)
const isHasNotify = (id, time) => notifications.findIndex(event => event.id === id && event.time === time) >= 0
const getEventIndex = (id, time) => notifications.findIndex(event => event.id === id && event.time === time)

const drawNotifications = notifications => {
    const eventsObj = document.getElementById('notifications')
    eventsObj.innerHTML = ''
    if (notifications && notifications.length > 0) {
        notifications.forEach(notify => {
            const notifyObj = document.createElement('div');
            const event = getEventById(notify.id)
            if (event) {
                notifyObj.classList = notify.isShown ? 'shown' : '';
                notifyObj.innerHTML = `
                <div class="name"> <a href='${event.link}' target='_blank'>${event.name}</a> за ${notify.time} дн.</div>
               <div class="notifies">
               <button onclick="delNotify(${notify.id},  ${notify.time})">Удалить</button>
</div>
`;
            }
            eventsObj.appendChild(notifyObj)
        })
    } else {
        const notifyObj = document.createElement('div');
        notifyObj.classList = `no-list`;
        notifyObj.innerHTML = `Пока уведомлений нет`;
        eventsObj.appendChild(notifyObj)
    }
}

const addNotify = (id, time) => {
    if (id && time && !isHasNotify(id, time)) {
        notifications.push({
            id, time
        })
        drawList(events)
        drawNotifications(notifications)
        setLocalNotifications()
    }

}

const delNotify = (id, time) => {
    if (id && time && isHasNotify(id, time)) {
        notifications.splice(getEventIndex(id, time), 1)
        drawList(events)
        drawNotifications(notifications)
        setLocalNotifications()
    }

}

const sendNotification = (title, body, icon, callback) => {
    Notification.requestPermission(permission => {
        if (permission === "granted") {
            const options = {body, icon};
            const n = new Notification(title, options);
            console.log(n)
            callback(n)
        }
    })
}

const checkNotifications = () => {
    if (notifications && notifications.length > 0) {
        notifications.forEach(notify => {
                const event = getEventById(notify.id)
                if (event && !notify.isShown) {
                    console.log(event, event.isShown)
                    // const dateNow = new Date(2019, 1, 10);
                    const dateNow = new Date();
                    const daysToEvent = Math.floor((event.date - dateNow) / (1000 * 60 * 60 * 24)) + 1
                    const daysToNotification = daysToEvent - notify.time
                    console.log(daysToNotification)
                    if (daysToNotification <= 0) {
                        sendNotification(event.name, `Мероприятие ${event.name} начнется через ${daysToEvent} дн. ${event.date}`, '', n => {
                            console.log( "notifications send")
                            notifications[getEventIndex(notify.id, notify.time)].isShown = true
                            drawNotifications(notifications)
                            setLocalNotifications()
                        })

                    }

                }
            }
        )
    }
}

const checkPermission = () => {
    {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        }

        // // Проверка разрешения на отправку уведомлений
        // else if (Notification.permission === "granted") {
        //     // Если разрешено, то создаем уведомление
        //     var notification = new Notification("Hi there!");
        // }

        // В противном случае, запрашиваем разрешение
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(permission => {
                // // Если пользователь разрешил, то создаем уведомление
                // if (permission === "granted") {
                //     var notification = new Notification("Hi there!");
                // }
            });
        }
    }
}

const setLocalNotifications = () => {
    console.log(JSON.stringify(notifications))
    localStorage.setItem('notifications', JSON.stringify(notifications))
}

const getLocalNotifications = () => {
    const notifies = localStorage.getItem("notifications")
    if (notifies) {
        notifications = JSON.parse(notifies)
    } else {
        notifications = []
    }
    // if (notifications == null) {
    //     notifications = []
    // }
    // else {
    //
    // }
}


window.onload = function () {
    getLocalNotifications()
    drawList(events)
    drawNotifications(notifications)
    checkPermission()
    setInterval(checkNotifications, 1000)
}


