console.log('xxxholic');
const debounce = require('lodash/debounce');

class UIDManager {
    constructor() {
        this.data = [];
    }

    getUIDList() {
        return this.data.slice(0);
    }

    addUID(uid) {
        this.data.push(uid);
    }

    sliceUIDList(index) {
        this.data = this.data.slice(index);
    }
}

class EventManager {
    constructor() {
        this.data = {};
    }

    addListener(uid, emitter) {
        if (this.data[uid]) {
            this.data[uid].push(emitter);
        } else {
            this.data[uid] = [emitter];
        }
    }

    fireEvent(uid, data) {
        this.data[uid] && this.data[uid].forEach(func => func(data));
        this.data[uid] = [];
    }
}

class ProfileManager {
    constructor() {
        this.data = {};
    }

    addProfile(profile) {
        this.data[profile.uid] = profile;
    }
    getProfile(uid) {
        return this.data[uid];
    }
}

const uidManager = new UIDManager();
const eventManager = new EventManager();
const profileManager = new ProfileManager();

var requestUserProfile = function (uidList) {  // uidList 是一个数组，最大接受 100 个 uid
    // 这个方法的实现不能修改

    /** 先去重 */
    var uidList = uidList || [];
    var _tmp = {};
    var _uidList = [];
    uidList.forEach(function (uid) {
        if (!_tmp[uid]) {
            _tmp[uid] = 1;
            _uidList.push(uid);
        }
    })
    _tmp = null;
    uidList = null;

    return Promise.resolve().then(function () {
        return new Promise(function (resolve, reject) {
            setTimeout(function () { // 模拟 ajax 异步，1s 返回
                console.log('ajax done');
                resolve();
            }, 1000);
        }).then(function () {
            var profileList = _uidList.map(function (uid) {
                if (uid < 0) {  // 模拟 uid 传错，服务端异常，获取不到部分 uid 对应的 profile 等异常场景
                    return null;
                } else {
                    return {
                        uid: uid,
                        nick: uid + 'Nick',
                        age: 18
                    }
                }
            });
            return profileList.filter(function (profile) {
                return profile !== null;
            });
        });
    });
}

const callApi = debounce(uidList => Promise.resolve()
    .then(() => requestUserProfile(uidList))
    .then(list => {

        uidList.forEach(uid => {
            const idx = list.findIndex(x => x.uid == uid);
            eventManager.fireEvent(uid, list[idx]);
        });

        uidManager.sliceUIDList(uidList.length);
    }), 250);


const getUserProfile = uid => new Promise((resolve, reject) => {
    const profile = profileManager.getProfile(uid);
    if (profile) return resolve(profile);

    uidManager.addUID(uid);

    eventManager.addListener(uid, profile => {
        if (profile) {
            resolve(profile);
            profileManager.addProfile(profile);
        } else {
            reject(profile);
        }
    });

    callApi(uidManager.getUIDList());
});

const success = profile => {
    console.log('请求成功');
    console.log(profile);
};

const fail = () => console.log('请求失败');


setTimeout(() => getUserProfile(1).then(success, fail).catch(fail), 10);
setTimeout(() => getUserProfile(-2).then(success, fail).catch(fail), 40);
setTimeout(() => getUserProfile(3).then(success, fail).catch(fail), 80);
setTimeout(() => getUserProfile(6).then(success, fail).catch(fail), 80);


setTimeout(() => getUserProfile(1).then(success, fail).catch(fail), 5110);
setTimeout(() => getUserProfile(1).then(success, fail).catch(fail), 5140);
setTimeout(() => getUserProfile(3).then(success, fail).catch(fail), 5180);
setTimeout(() => getUserProfile(6).then(success, fail).catch(fail), 5180);
