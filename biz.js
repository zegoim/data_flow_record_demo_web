
const parentId = 'playback-content';
const _config_ = {
    userid: 'userid',
    roomid: 'roomid',
    username: 'web-record-demo',
    whiteboard_env: '', // -test
    docs_env: '', // test
    dynamicPPT_HD: 'false', // false,true
    pptStepMode: '1', // 1,2
    thumbnailMode: '3', // 1,2,3
    fontFamily: '' // ZgFont
};

const zegoConfig = {
    ..._config_,
    appID: '',
    server: '',
    isDocTestEnv: true,
    tokenUrl: '',
    autoLogin: false
};

var zegoWhiteboard, // 白板SDK实例
    zegoDocs,       // 文件SDK实例
    zegoRecorderPlayback; // 数据流回放SDK实例

function initSDK(token) {
    zegoWhiteboard = new ZegoExpressEngine(zegoConfig.appID, zegoConfig.server);
    zegoWhiteboard.setLogConfig({ logLevel: 'info' });
    zegoWhiteboard.setDebugVerbose(false);

    // 文件转码
    const userID = zegoConfig.userid;
    zegoDocs = new ZegoExpressDocs({
        appID: zegoConfig.appID,
        userID,
        token,
        isTestEnv: zegoConfig.isDocTestEnv
    });
    console.log('互动白板 sdk 版本:' + zegoWhiteboard.getVersion(), '文件转码 sdk 版本:' + zegoDocs.getVersion());
}

function getToken() {
    return new Promise((resolve) => {
        $.get(
            zegoConfig.tokenUrl,
            { app_id: zegoConfig.appID, id_name: zegoConfig.userid },
            function(token) {
                if (token) {
                    resolve(token);
                }
            },
            'text'
        );
    });
}

function initPlay() {
    zegoRecorderPlayback = ZegoRecorderEngine.initPlaybackEngine([zegoWhiteboard, zegoDocs]);
    zegoRecorderPlayback.on('loadComplete',  () => {
        console.warn('loadComplete done');
        const view = document.getElementById(parentId);
        zegoRecorderPlayback.setPlayView(view);
    });
    zegoRecorderPlayback.on('mediaStreamStart', (e) => {
        console.warn('mediaStreamStart', e);
    });
    zegoRecorderPlayback.on('mediaStreamStop', () => {
        console.warn('mediaStreamStop');
    });
    zegoRecorderPlayback.on('whiteboardSwitch', (id) => {
        console.warn('whiteboardSwitch', id);
    });
    zegoRecorderPlayback.on('playStateUpdate', (e) => {
        console.warn('playStateUpdate', e);
    });
    zegoRecorderPlayback.on('error',  (err) => {
        console.warn('error', err);
    });
}

async function seekTo(timestamp) {
    try {
        await zegoRecorderPlayback.seekTo(timestamp);

    } catch (e) {
        console.error(e);
    }
}

function getPlayInfo(task_id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: localStorage['zego-playback-url'],
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify({
                'app_id': '',
                'access_token': '',
                'task_id': task_id
            }),
            success: (data) => {
                console.warn('getPlayInfo', data);
                if (data.code == 0) {
                    console.warn('success', JSON.parse(data.play_info));
                    resolve(JSON.parse(data.play_info));
                } else {
                    reject(data);
                }

            }
        })
    })

}
