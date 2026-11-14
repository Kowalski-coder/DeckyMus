const manifest = {"name":"DeckyMus"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const routerHook = api.routerHook;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

// Player Core
const rpcGetStatus = callable("get_status");
const rpcPlayPause = callable("play_pause");
callable("play");
callable("pause");
callable("stop");
const rpcNextTrack = callable("next_track");
const rpcPreviousTrack = callable("previous_track");
const rpcSeek = callable("seek");
const rpcSetVolume = callable("set_volume");
const rpcSetRepeat = callable("set_repeat");
const rpcToggleShuffle = callable("toggle_shuffle");
callable("play_track");
const rpcPlayQueue = callable("play_queue");
callable("play_index");
callable("get_queue");
callable("clear_queue");
// Local Library
const rpcGetLocalFolders = callable("get_local_folders");
const rpcSetLocalFolders = callable("set_local_folders");
const rpcScanLocalMusic = callable("scan_local_music");
const rpcBrowseDirectory = callable("browse_directory");
// Yandex Music
const rpcYandexSetToken = callable("yandex_set_token");
const rpcYandexLogout = callable("yandex_logout");
callable("yandex_start_auth");
const rpcYandexGetStatus = callable("yandex_get_status");
const rpcYandexGetPlaylists = callable("yandex_get_playlists");
const rpcYandexGetPlaylistTracks = callable("yandex_get_playlist_tracks");
const rpcYandexGetChart = callable("yandex_get_chart");
// VK Музыка
const rpcVkGetStatus = callable("vk_get_status");
callable("vk_set_token");
const rpcVkLogout = callable("vk_logout");
const rpcVkGetMyMusic = callable("vk_get_my_music");
const rpcVkGetPlaylists = callable("vk_get_playlists");
const rpcVkGetPlaylistTracks = callable("vk_get_playlist_tracks");
const rpcVkSearch = callable("vk_search");
// Spotify
const rpcSpotifyGetStatus = callable("spotify_get_status");
callable("spotify_set_credentials");
callable("spotify_set_token");
const rpcSpotifyLogout = callable("spotify_logout");
const rpcSpotifyGetPlaylists = callable("spotify_get_playlists");
const rpcSpotifyGetPlaylistTracks = callable("spotify_get_playlist_tracks");
const rpcSpotifyGetLikedTracks = callable("spotify_get_liked_tracks");
const rpcSpotifySearch = callable("spotify_search");
// YouTube Music
const rpcYtSearch = callable("yt_search");
// Downloads & Offline Storage
const rpcGetDownloadFolder = callable("get_download_folder");
const rpcSetDownloadFolder = callable("set_download_folder");
const rpcGetDownloadedInfo = callable("get_downloaded_info");
const rpcDownloadTrack = callable("download_track");
// Browser Opener
const rpcOpenBrowser = callable("open_browser");

const DeckyMusIcon = ({ size = 18 }) => {
    return (SP_JSX.jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", xmlns: "http://www.w3.org/2000/svg", style: { display: "inline-block", verticalAlign: "middle" }, children: SP_JSX.jsx("path", { d: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" }) }));
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var attr = props.attr,
      size = props.size,
      title = props.title,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaYoutube (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"},"child":[]}]})(props);
}function FaVolumeUp (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zm233.32-51.08c-11.17-7.33-26.18-4.24-33.51 6.95-7.34 11.17-4.22 26.18 6.95 33.51 66.27 43.49 105.82 116.6 105.82 195.58 0 78.98-39.55 152.09-105.82 195.58-11.17 7.32-14.29 22.34-6.95 33.5 7.04 10.71 21.93 14.56 33.51 6.95C528.27 439.58 576 351.33 576 256S528.27 72.43 448.35 19.97zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.54 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z"},"child":[]}]})(props);
}function FaVolumeMute (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zM461.64 256l45.64-45.64c6.3-6.3 6.3-16.52 0-22.82l-22.82-22.82c-6.3-6.3-16.52-6.3-22.82 0L416 210.36l-45.64-45.64c-6.3-6.3-16.52-6.3-22.82 0l-22.82 22.82c-6.3 6.3-6.3 16.52 0 22.82L370.36 256l-45.63 45.63c-6.3 6.3-6.3 16.52 0 22.82l22.82 22.82c6.3 6.3 16.52 6.3 22.82 0L416 301.64l45.64 45.64c6.3 6.3 16.52 6.3 22.82 0l22.82-22.82c6.3-6.3 6.3-16.52 0-22.82L461.64 256z"},"child":[]}]})(props);
}function FaVolumeDown (props) {
  return GenIcon({"attr":{"viewBox":"0 0 384 512"},"child":[{"tag":"path","attr":{"d":"M215.03 72.04L126.06 161H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V89.02c0-21.47-25.96-31.98-40.97-16.98zm123.2 108.08c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 229.28 336 242.62 336 257c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.87z"},"child":[]}]})(props);
}function FaTrash (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"},"child":[]}]})(props);
}function FaTimes (props) {
  return GenIcon({"attr":{"viewBox":"0 0 352 512"},"child":[{"tag":"path","attr":{"d":"M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"},"child":[]}]})(props);
}function FaSync (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M440.65 12.57l4 82.77A247.16 247.16 0 0 0 255.83 8C134.73 8 33.91 94.92 12.29 209.82A12 12 0 0 0 24.09 224h49.05a12 12 0 0 0 11.67-9.26 175.91 175.91 0 0 1 317-56.94l-101.46-4.86a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12H500a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12h-47.37a12 12 0 0 0-11.98 12.57zM255.83 432a175.61 175.61 0 0 1-146-77.8l101.8 4.87a12 12 0 0 0 12.57-12v-47.4a12 12 0 0 0-12-12H12a12 12 0 0 0-12 12V500a12 12 0 0 0 12 12h47.35a12 12 0 0 0 12-12.6l-4.15-82.57A247.17 247.17 0 0 0 255.83 504c121.11 0 221.93-86.92 243.55-201.82a12 12 0 0 0-11.8-14.18h-49.05a12 12 0 0 0-11.67 9.26A175.86 175.86 0 0 1 255.83 432z"},"child":[]}]})(props);
}function FaSpinner (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"},"child":[]}]})(props);
}function FaSignOutAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"},"child":[]}]})(props);
}function FaSearch (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"},"child":[]}]})(props);
}function FaRedo (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 82.76A247.42 247.42 0 0 0 256 8C119.34 8 7.9 119.53 8 256.19 8.1 393.07 119.1 504 256 504a247.1 247.1 0 0 0 166.18-63.91 12 12 0 0 0 .48-17.43l-34-34a12 12 0 0 0-16.38-.55A176 176 0 1 1 402.1 157.8l-101.53-4.87a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12h200.33a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12z"},"child":[]}]})(props);
}function FaRandom (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M504.971 359.029c9.373 9.373 9.373 24.569 0 33.941l-80 79.984c-15.01 15.01-40.971 4.49-40.971-16.971V416h-58.785a12.004 12.004 0 0 1-8.773-3.812l-70.556-75.596 53.333-57.143L352 336h32v-39.981c0-21.438 25.943-31.998 40.971-16.971l80 79.981zM12 176h84l52.781 56.551 53.333-57.143-70.556-75.596A11.999 11.999 0 0 0 122.785 96H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12zm372 0v39.984c0 21.46 25.961 31.98 40.971 16.971l80-79.984c9.373-9.373 9.373-24.569 0-33.941l-80-79.981C409.943 24.021 384 34.582 384 56.019V96h-58.785a12.004 12.004 0 0 0-8.773 3.812L96 336H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h110.785c3.326 0 6.503-1.381 8.773-3.812L352 176h32z"},"child":[]}]})(props);
}function FaPuzzlePiece (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M519.442 288.651c-41.519 0-59.5 31.593-82.058 31.593C377.409 320.244 432 144 432 144s-196.288 80-196.288-3.297c0-35.827 36.288-46.25 36.288-85.985C272 19.216 243.885 0 210.539 0c-34.654 0-66.366 18.891-66.366 56.346 0 41.364 31.711 59.277 31.711 81.75C175.885 207.719 0 166.758 0 166.758v333.237s178.635 41.047 178.635-28.662c0-22.473-40-40.107-40-81.471 0-37.456 29.25-56.346 63.577-56.346 33.673 0 61.788 19.216 61.788 54.717 0 39.735-36.288 50.158-36.288 85.985 0 60.803 129.675 25.73 181.23 25.73 0 0-34.725-120.101 25.827-120.101 35.962 0 46.423 36.152 86.308 36.152C556.712 416 576 387.99 576 354.443c0-34.199-18.962-65.792-56.558-65.792z"},"child":[]}]})(props);
}function FaPlay (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"},"child":[]}]})(props);
}function FaPlayCircle (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm115.7 272l-176 101c-15.8 8.8-35.7-2.5-35.7-21V152c0-18.4 19.8-29.8 35.7-21l176 107c16.4 9.2 16.4 32.9 0 42z"},"child":[]}]})(props);
}function FaPause (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"},"child":[]}]})(props);
}function FaMusic (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z"},"child":[]}]})(props);
}function FaListUl (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M48 48a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 16H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"},"child":[]}]})(props);
}function FaLevelUpAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 320 512"},"child":[{"tag":"path","attr":{"d":"M313.553 119.669L209.587 7.666c-9.485-10.214-25.676-10.229-35.174 0L70.438 119.669C56.232 134.969 67.062 160 88.025 160H152v272H68.024a11.996 11.996 0 0 0-8.485 3.515l-56 56C-4.021 499.074 1.333 512 12.024 512H208c13.255 0 24-10.745 24-24V160h63.966c20.878 0 31.851-24.969 17.587-40.331z"},"child":[]}]})(props);
}function FaHeart (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"},"child":[]}]})(props);
}function FaHeadphones (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M256 32C114.52 32 0 146.496 0 288v48a32 32 0 0 0 17.689 28.622l14.383 7.191C34.083 431.903 83.421 480 144 480h24c13.255 0 24-10.745 24-24V280c0-13.255-10.745-24-24-24h-24c-31.342 0-59.671 12.879-80 33.627V288c0-105.869 86.131-192 192-192s192 86.131 192 192v1.627C427.671 268.879 399.342 256 368 256h-24c-13.255 0-24 10.745-24 24v176c0 13.255 10.745 24 24 24h24c60.579 0 109.917-48.098 111.928-108.187l14.382-7.191A32 32 0 0 0 512 336v-48c0-141.479-114.496-256-256-256z"},"child":[]}]})(props);
}function FaGlobe (props) {
  return GenIcon({"attr":{"viewBox":"0 0 496 512"},"child":[{"tag":"path","attr":{"d":"M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z"},"child":[]}]})(props);
}function FaForward (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M500.5 231.4l-192-160C287.9 54.3 256 68.6 256 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2zm-256 0l-192-160C31.9 54.3 0 68.6 0 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2z"},"child":[]}]})(props);
}function FaFolder (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z"},"child":[]}]})(props);
}function FaFolderOpen (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M572.694 292.093L500.27 416.248A63.997 63.997 0 0 1 444.989 448H45.025c-18.523 0-30.064-20.093-20.731-36.093l72.424-124.155A64 64 0 0 1 152 256h399.964c18.523 0 30.064 20.093 20.73 36.093zM152 224h328v-48c0-26.51-21.49-48-48-48H272l-64-64H48C21.49 64 0 85.49 0 112v278.046l69.077-118.418C86.214 242.25 117.989 224 152 224z"},"child":[]}]})(props);
}function FaExternalLinkAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"},"child":[]}]})(props);
}function FaExpandAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M212.686 315.314L120 408l32.922 31.029c15.12 15.12 4.412 40.971-16.97 40.971h-112C10.697 480 0 469.255 0 456V344c0-21.382 25.803-32.09 40.922-16.971L72 360l92.686-92.686c6.248-6.248 16.379-6.248 22.627 0l25.373 25.373c6.249 6.248 6.249 16.378 0 22.627zm22.628-118.628L328 104l-32.922-31.029C279.958 57.851 290.666 32 312.048 32h112C437.303 32 448 42.745 448 56v112c0 21.382-25.803 32.09-40.922 16.971L376 152l-92.686 92.686c-6.248 6.248-16.379 6.248-22.627 0l-25.373-25.373c-6.249-6.248-6.249-16.378 0-22.627z"},"child":[]}]})(props);
}function FaDownload (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"},"child":[]}]})(props);
}function FaCog (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"},"child":[]}]})(props);
}function FaCheck (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"},"child":[]}]})(props);
}function FaCheckCircle (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"},"child":[]}]})(props);
}function FaChartLine (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"},"child":[]}]})(props);
}function FaBackward (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M11.5 280.6l192 160c20.6 17.2 52.5 2.8 52.5-24.6V96c0-27.4-31.9-41.8-52.5-24.6l-192 160c-15.3 12.8-15.3 36.4 0 49.2zm256 0l192 160c20.6 17.2 52.5 2.8 52.5-24.6V96c0-27.4-31.9-41.8-52.5-24.6l-192 160c-15.3 12.8-15.3 36.4 0 49.2z"},"child":[]}]})(props);
}function FaArrowLeft (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"},"child":[]}]})(props);
}

const translations = {
    "ru": {
        "tabPlayer": "Плеер",
        "tabLocal": "Моя музыка",
        "tabVk": "VK Музыка",
        "tabYandex": "Яндекс Музыка",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Настройки",
        "tabAbout": "О плагине",
        "openLibrary": "Открыть библиотеку",
        "shuffle": "Случайно",
        "repeatOff": "Повтор выкл",
        "repeatAll": "Повтор всех",
        "repeatOne": "Повтор 1",
        "statusPlaying": "Играет",
        "statusPaused": "Пауза",
        "statusStopped": "Остановлен",
        "noTrackSelected": "Трек не выбран",
        "selectSongHint": "Выберите песню во вкладке слева",
        "clickOpenLibraryHint": "Нажмите «Открыть библиотеку»",
        "albumPrefix": "Альбом: ",
        "volLabel": "Громк.",
        "unmute": "Включить звук",
        "mute": "Выключить звук",
        "sourceVk": "VK Музыка",
        "sourceYandex": "Яндекс Музыка",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Локальный файл",
        "nowPlayingHeader": "Сейчас играет",
        "repeatMode1": "1",
        "repeatModeAll": "Все",
        "repeatModeOff": "Выкл",
        "localSectionTitle": "Локальная музыка",
        "searchTracksPlaceholder": "Поиск по трекам",
        "refreshBtn": "Обновить",
        "searchingBtn": "Поиск...",
        "tracksFound": "Найдено треков: {0}",
        "musicNotFound": "Музыка не найдена.",
        "musicNotFoundHint": "Добавьте папки во вкладке «Настройки» или поместите файлы в ~/Music.",
        "unknownArtist": "Неизвестный исполнитель",
        "vkSectionTitle": "VK Музыка",
        "inDevelopmentBadge": "В разработке",
        "vkBannerTitle": "Данный раздел находится в разработке, ожидайте ближайших обновлений",
        "vkBannerDesc": "В будущем обновлении здесь появится поиск, воспроизведение и скачивание треков и плейлистов из ВКонтакте.",
        "yandexSectionTitle": "Яндекс Музыка",
        "authHeader": "Авторизация",
        "authDesc": "Войдите через токен Яндекс Музыки для доступа к вашей медиатеке.",
        "tokenFieldLabel": "Токен аккаунта Яндекс",
        "loginBtn": "Войти",
        "logoutBtn": "Выйти",
        "connectedAs": "Подключено: {0}",
        "notAuthorizedHint": "Не авторизован (доступен только общий чарт)",
        "chartTitle": "Чарт Яндекс Музыки",
        "playlistsTitle": "Плейлисты",
        "loadingTracks": "Загрузка треков...",
        "downloadingTrack": "Скачивание: «{0}»...",
        "downloadSuccess": "«{0}» успешно скачан в папку загрузок!",
        "downloadError": "Ошибка скачивания: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Поиск треков и видео в YouTube Music",
        "searchBtn": "Искать",
        "ytSearching": "Поиск в YouTube...",
        "ytEnterQueryHint": "Введите название трека или исполнителя для поиска",
        "nothingFound": "Ничего не найдено",
        "tryDifferentQuery": "Попробуйте изменить поисковый запрос",
        "settingsSectionDownload": "Папка для загрузок",
        "settingsDownloadDesc": "Директория для сохранения музыки из Яндекс Музыки и YouTube Music:",
        "settingsNotSelected": "Не выбрана",
        "selectFolderBtn": "Выбрать папку",
        "downloadFolderUpdated": "Папка загрузок успешно обновлена!",
        "settingsSectionLibrary": "Папки с музыкой (Медиатека)",
        "selectAndAddFolderBtn": "Выбрать и добавить папку",
        "folderAddedSuccess": "Папка успешно добавлена!",
        "noAddedFolders": "Нет добавленных папок",
        "autoScanNotice": "Автоматически сканируются папки ~/Music и подключенные microSD карты.",
        "modalTitleDownload": "Выбор папки для загрузок",
        "modalTitleLibrary": "Выбор папки с музыкой",
        "modalHeaderDownload": "Выберите папку для сохранения треков",
        "modalHeaderLibrary": "Выбор папки для добавления в медиатеку",
        "quickSelect": "Быстрый выбор:",
        "currentFolder": "Текущая папка:",
        "upBtn": "Вверх",
        "selectThisFolderBtn": "Выбрать эту папку",
        "foldersList": "Папки:",
        "noSubfolders": "Нет вложенных папок",
        "loading": "Загрузка...",
        "languageSettingTitle": "Язык интерфейса",
        "languageSettingDesc": "Язык приложения (по умолчанию определяется языком Steam):",
        "languageAuto": "Авто (Язык Steam)",
        "aboutTagline": "Музыкальный плеер с возможностью воспроизведения и скачивания музыкальных треков со стриминговых площадок специально для Decky Loader Россия",
        "featuresTitle": "Возможности плагина",
        "featBackgroundTitle": "Фоновое воспроизведение",
        "featBackgroundDesc": "Музыка звучит параллельно с любыми запущенными играми в Game Mode без потери производительности.",
        "featLocalTitle": "Локальная медиатека",
        "featLocalDesc": "Сканирование папок встроенной памяти и карт microSD (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Музыка",
        "featVkDesc": "Интеграция музыки ВКонтакте: поиск, прослушивание и скачивание аудиозаписей (в разработке).",
        "featYandexTitle": "Яндекс Музыка",
        "featYandexDesc": "Стриминг треков, синхронизация плейлистов, любимых песен «Мне нравится» и чарта Top-50.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Быстрый глобальный поиск треков, исполнителей и альбомов с сохранением истории запроса.",
        "featDownloadTitle": "Скачивание в память устройства",
        "featDownloadDesc": "Сохранение треков из Яндекс Музыки и YouTube Music в выбранную папку в формате MP3 с тегами и обложками для офлайн-прослушивания.",
        "techInfoTitle": "Технические сведения",
        "techAudioEngine": "Аудиодвижок:",
        "techInterface": "Интерфейс:",
        "techConversion": "Конвертация аудио:",
        "techCreatedFor": "Создано для Decky Loader Россия (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "Моя музыка",
        "myPlaylists": "Мои плейлисты",
        "likedTracks": "Любимые треки",
        "openInBrowser": "Открыть в браузере",
        "scanQrWithPhone": "Отсканируйте камерой смартфона:",
        "pasteTokenOrUrl": "Или вставьте токен / URL переадресации:",
        "tokenFieldPlaceholder": "Токен или ссылка из адресной строки",
        "vkInstructions": "1. Нажмите «Открыть в браузере».\n2. Нажмите «Разрешить» на открывшейся странице ВКонтакте.\n3. Вход в аккаунт произойдет автоматически.",
        "betaNotice": "Бета-версия: данный раздел может работать некорректно.",
        "spotifyInstructions": "1. Нажмите «Открыть в браузере» или отсканируйте QR-код для входа через Spotify.\n2. Также можно указать Client ID и Client Secret из Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Сохранить ключи",
        "spotifyAuthWithCredentials": "Войти с ключами",
        "noPlaylistsFound": "Плейлисты не найдены",
        "noTracksFound": "Треки не найдены",
        "backToPlaylists": "← К плейлистам",
        "trackCount": "{0} треков",
        "searchResults": "Результаты поиска",
        "searchVkPlaceholder": "Поиск треков в VK Музыке",
        "searchSpotifyPlaceholder": "Поиск треков в Spotify",
        "vkAuthHeader": "Авторизация VK Музыка",
        "spotifyAuthHeader": "Авторизация Spotify",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Полноценный поиск, прослушивание и скачивание треков и плейлистов из Spotify."
    },
    "en": {
        "tabPlayer": "Player",
        "tabLocal": "My Music",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Settings",
        "tabAbout": "About",
        "openLibrary": "Open Library",
        "shuffle": "Shuffle",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Playing",
        "statusPaused": "Paused",
        "statusStopped": "Stopped",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Vol.",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Refresh",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Search",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Select Folder",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Auto (Steam Language)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "de": {
        "tabPlayer": "Player",
        "tabLocal": "Meine Musik",
        "tabVk": "VK Musik",
        "tabYandex": "Yandex Musik",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Einstellungen",
        "tabAbout": "Über das Plugin",
        "openLibrary": "Bibliothek öffnen",
        "shuffle": "Zufall",
        "repeatOff": "Wiederh. aus",
        "repeatAll": "Alle wiederholen",
        "repeatOne": "Titel wiederholen",
        "statusPlaying": "Wiedergabe",
        "statusPaused": "Pause",
        "statusStopped": "Gestoppt",
        "noTrackSelected": "Kein Titel ausgewählt",
        "selectSongHint": "Wählen Sie ein Lied aus dem linken Menü",
        "clickOpenLibraryHint": "Klicken Sie auf «Bibliothek öffnen»",
        "albumPrefix": "Album: ",
        "volLabel": "Lautst.",
        "unmute": "Ton an",
        "mute": "Stumm",
        "sourceVk": "VK Musik",
        "sourceYandex": "Yandex Musik",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Lokale Datei",
        "nowPlayingHeader": "Aktuelle Wiedergabe",
        "repeatMode1": "1",
        "repeatModeAll": "Alle",
        "repeatModeOff": "Aus",
        "localSectionTitle": "Lokale Musik",
        "searchTracksPlaceholder": "Titel durchsuchen",
        "refreshBtn": "Aktualisieren",
        "searchingBtn": "Suche...",
        "tracksFound": "Gefundene Titel: {0}",
        "musicNotFound": "Keine Musik gefunden.",
        "musicNotFoundHint": "Ordner in «Einstellungen» hinzufügen oder Dateien in ~/Music ablegen.",
        "unknownArtist": "Unbekannter Künstler",
        "vkSectionTitle": "VK Musik",
        "inDevelopmentBadge": "In Entwicklung",
        "vkBannerTitle": "Dieser Bereich befindet sich in der Entwicklung",
        "vkBannerDesc": "Ein zukünftiges Update bringt Suche, Wiedergabe und Download aus VKontakte.",
        "yandexSectionTitle": "Yandex Musik",
        "authHeader": "Autorisierung",
        "authDesc": "Mit Yandex-Token anmelden, um auf Ihre Bibliothek zuzugreifen.",
        "tokenFieldLabel": "Yandex-Konto-Token",
        "loginBtn": "Anmelden",
        "logoutBtn": "Abmelden",
        "connectedAs": "Verbunden: {0}",
        "notAuthorizedHint": "Nicht autorisiert (nur öffentliche Charts verfügbar)",
        "chartTitle": "Yandex Musik Charts",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Titel werden geladen...",
        "downloadingTrack": "Herunterladen: «{0}»...",
        "downloadSuccess": "«{0}» erfolgreich heruntergeladen!",
        "downloadError": "Download-Fehler: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Titel und Videos in YouTube Music suchen",
        "searchBtn": "Suchen",
        "ytSearching": "YouTube durchsuchen...",
        "ytEnterQueryHint": "Titel oder Künstler eingeben",
        "nothingFound": "Nichts gefunden",
        "tryDifferentQuery": "Versuchen Sie eine andere Suchanfrage",
        "settingsSectionDownload": "Download-Ordner",
        "settingsDownloadDesc": "Verzeichnis zum Speichern von Musik aus Yandex und YouTube Music:",
        "settingsNotSelected": "Nicht ausgewählt",
        "selectFolderBtn": "Ordner wählen",
        "downloadFolderUpdated": "Download-Ordner erfolgreich aktualisiert!",
        "settingsSectionLibrary": "Musikordner (Bibliothek)",
        "selectAndAddFolderBtn": "Ordner wählen und hinzufügen",
        "folderAddedSuccess": "Ordner erfolgreich hinzugefügt!",
        "noAddedFolders": "Keine Ordner hinzugefügt",
        "autoScanNotice": "Ordner ~/Music und microSD-Karten werden automatisch gescannt.",
        "modalTitleDownload": "Download-Ordner auswählen",
        "modalTitleLibrary": "Musikordner auswählen",
        "modalHeaderDownload": "Ordner zum Speichern von Titeln auswählen",
        "modalHeaderLibrary": "Ordner zur Bibliothek hinzufügen",
        "quickSelect": "Schnellauswahl:",
        "currentFolder": "Aktueller Ordner:",
        "upBtn": "Nach oben",
        "selectThisFolderBtn": "Diesen Ordner auswählen",
        "foldersList": "Ordner:",
        "noSubfolders": "Keine Unterordner",
        "loading": "Wird geladen...",
        "languageSettingTitle": "Oberflächensprache",
        "languageSettingDesc": "Sprache der Anwendung (Standard: Steam-Systemsprache):",
        "languageAuto": "Automatisch (Steam-Sprache)",
        "aboutTagline": "Musikplayer mit Streaming und Download speziell für Decky Loader Russia entwickelt",
        "featuresTitle": "Funktionen des Plugins",
        "featBackgroundTitle": "Hintergrundwiedergabe",
        "featBackgroundDesc": "Musik läuft parallel zu jedem Spiel im Game Mode ohne Leistungsverlust.",
        "featLocalTitle": "Lokale Medienbibliothek",
        "featLocalDesc": "Durchsucht internen Speicher und microSD (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Musik",
        "featVkDesc": "VKontakte-Integration: Suche, Streaming und Download (in Entwicklung).",
        "featYandexTitle": "Yandex Musik",
        "featYandexDesc": "Streaming, Playlist-Synchronisation und Top-50-Charts.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Schnelle globale Suche nach Titeln, Künstlern und Alben.",
        "featDownloadTitle": "Auf Gerät herunterladen",
        "featDownloadDesc": "Titel aus Yandex und YouTube Music als MP3 mit Tags und Covern speichern.",
        "techInfoTitle": "Technische Details",
        "techAudioEngine": "Audio-Engine:",
        "techInterface": "Benutzeroberfläche:",
        "techConversion": "Audio-Konvertierung:",
        "techCreatedFor": "Erstellt für Decky Loader Russia (deckyloader.ru)"
    },
    "fr": {
        "tabPlayer": "Lecteur",
        "tabLocal": "Ma musique",
        "tabVk": "Musique VK",
        "tabYandex": "Yandex Musique",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Paramètres",
        "tabAbout": "À propos",
        "openLibrary": "Ouvrir la bibliothèque",
        "shuffle": "Aléatoire",
        "repeatOff": "Répétition désact.",
        "repeatAll": "Tout répéter",
        "repeatOne": "Répéter 1",
        "statusPlaying": "Lecture",
        "statusPaused": "Pause",
        "statusStopped": "Arrêté",
        "noTrackSelected": "Aucun morceau sélectionné",
        "selectSongHint": "Sélectionnez un morceau dans le menu de gauche",
        "clickOpenLibraryHint": "Cliquez sur «Ouvrir la bibliothèque»",
        "albumPrefix": "Album: ",
        "volLabel": "Vol.",
        "unmute": "Activer le son",
        "mute": "Couper le son",
        "sourceVk": "Musique VK",
        "sourceYandex": "Yandex Musique",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Fichier local",
        "nowPlayingHeader": "En cours de lecture",
        "repeatMode1": "1",
        "repeatModeAll": "Tout",
        "repeatModeOff": "Désact.",
        "localSectionTitle": "Musique locale",
        "searchTracksPlaceholder": "Rechercher des morceaux",
        "refreshBtn": "Actualiser",
        "searchingBtn": "Recherche...",
        "tracksFound": "Morceaux trouvés: {0}",
        "musicNotFound": "Aucune musique trouvée.",
        "musicNotFoundHint": "Ajoutez des dossiers dans «Paramètres» ou placez des fichiers dans ~/Music.",
        "unknownArtist": "Artiste inconnu",
        "vkSectionTitle": "Musique VK",
        "inDevelopmentBadge": "En développement",
        "vkBannerTitle": "Cette section est en cours de développement",
        "vkBannerDesc": "Une future mise à jour introduira la recherche, l'écoute et le téléchargement depuis VKontakte.",
        "yandexSectionTitle": "Yandex Musique",
        "authHeader": "Autorisation",
        "authDesc": "Connectez-vous via le jeton Yandex pour accéder à votre bibliothèque.",
        "tokenFieldLabel": "Jeton de compte Yandex",
        "loginBtn": "Connexion",
        "logoutBtn": "Déconnexion",
        "connectedAs": "Connecté: {0}",
        "notAuthorizedHint": "Non autorisé (seul le classement public est accessible)",
        "chartTitle": "Classement Yandex",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Chargement des morceaux...",
        "downloadingTrack": "Téléchargement: «{0}»...",
        "downloadSuccess": "«{0}» téléchargé avec succès!",
        "downloadError": "Erreur de téléchargement: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Rechercher des morceaux et vidéos",
        "searchBtn": "Chercher",
        "ytSearching": "Recherche sur YouTube...",
        "ytEnterQueryHint": "Entrez un titre ou un artiste pour rechercher",
        "nothingFound": "Rien trouvé",
        "tryDifferentQuery": "Essayez une autre requête de recherche",
        "settingsSectionDownload": "Dossier de téléchargement",
        "settingsDownloadDesc": "Dossier pour enregistrer la musique de Yandex et YouTube Music:",
        "settingsNotSelected": "Non sélectionné",
        "selectFolderBtn": "Choisir le dossier",
        "downloadFolderUpdated": "Dossier de téléchargement mis à jour!",
        "settingsSectionLibrary": "Dossiers musicaux (Bibliothèque)",
        "selectAndAddFolderBtn": "Choisir et ajouter un dossier",
        "folderAddedSuccess": "Dossier ajouté avec succès!",
        "noAddedFolders": "Aucun dossier ajouté",
        "autoScanNotice": "Le dossier ~/Music et les cartes microSD sont analysés automatiquement.",
        "modalTitleDownload": "Sélectionner le dossier de téléchargement",
        "modalTitleLibrary": "Sélectionner le dossier musical",
        "modalHeaderDownload": "Choisissez le dossier de sauvegarde",
        "modalHeaderLibrary": "Choisissez le dossier à ajouter",
        "quickSelect": "Sélection rapide:",
        "currentFolder": "Dossier actuel:",
        "upBtn": "Haut",
        "selectThisFolderBtn": "Sélectionner ce dossier",
        "foldersList": "Dossiers:",
        "noSubfolders": "Aucun sous-dossier",
        "loading": "Chargement...",
        "languageSettingTitle": "Langue de l'interface",
        "languageSettingDesc": "Langue de l'application (par défaut: langue du système Steam):",
        "languageAuto": "Auto (Langue Steam)",
        "aboutTagline": "Lecteur audio avec streaming et téléchargement conçu spécialement pour Decky Loader Russia",
        "featuresTitle": "Fonctionnalités",
        "featBackgroundTitle": "Lecture en arrière-plan",
        "featBackgroundDesc": "La musique joue en parallèle avec vos jeux en Game Mode sans aucune perte de performance.",
        "featLocalTitle": "Bibliothèque locale",
        "featLocalDesc": "Analyse du stockage interne et des cartes microSD (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "Musique VK",
        "featVkDesc": "Intégration VKontakte: recherche, streaming et téléchargement (en cours de développement).",
        "featYandexTitle": "Yandex Musique",
        "featYandexDesc": "Streaming, synchronisation des playlists et classement Top-50.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Recherche globale et rapide de titres, artistes et albums.",
        "featDownloadTitle": "Téléchargement sur l'appareil",
        "featDownloadDesc": "Enregistrez vos titres en MP3 avec métadonnées et pochettes pour une écoute hors ligne.",
        "techInfoTitle": "Informations techniques",
        "techAudioEngine": "Moteur audio:",
        "techInterface": "Interface utilisateur:",
        "techConversion": "Conversion audio:",
        "techCreatedFor": "Créé pour Decky Loader Russia (deckyloader.ru)"
    },
    "es": {
        "tabPlayer": "Reproductor",
        "tabLocal": "Mi música",
        "tabVk": "Música VK",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Ajustes",
        "tabAbout": "Acerca de",
        "openLibrary": "Abrir biblioteca",
        "shuffle": "Aleatorio",
        "repeatOff": "Repetir: no",
        "repeatAll": "Repetir todo",
        "repeatOne": "Repetir 1",
        "statusPlaying": "Reproduciendo",
        "statusPaused": "Pausa",
        "statusStopped": "Detenido",
        "noTrackSelected": "Ninguna pista seleccionada",
        "selectSongHint": "Seleccione una canción en el menú izquierdo",
        "clickOpenLibraryHint": "Haga clic en «Abrir biblioteca»",
        "albumPrefix": "Álbum: ",
        "volLabel": "Vol.",
        "unmute": "Activar sonido",
        "mute": "Silenciar",
        "sourceVk": "Música VK",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Archivo local",
        "nowPlayingHeader": "En reproducción",
        "repeatMode1": "1",
        "repeatModeAll": "Todo",
        "repeatModeOff": "Desact.",
        "localSectionTitle": "Música local",
        "searchTracksPlaceholder": "Buscar pistas",
        "refreshBtn": "Actualizar",
        "searchingBtn": "Buscando...",
        "tracksFound": "Pistas encontradas: {0}",
        "musicNotFound": "No se encontró música.",
        "musicNotFoundHint": "Añada carpetas en «Ajustes» o coloque archivos en ~/Music.",
        "unknownArtist": "Artista desconocido",
        "vkSectionTitle": "Música VK",
        "inDevelopmentBadge": "En desarrollo",
        "vkBannerTitle": "Esta sección está en desarrollo",
        "vkBannerDesc": "Una actualización futura incluirá búsqueda, reproducción y descarga desde VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Autorización",
        "authDesc": "Inicie sesión con el token de Yandex Music para acceder a su biblioteca.",
        "tokenFieldLabel": "Token de cuenta Yandex",
        "loginBtn": "Entrar",
        "logoutBtn": "Salir",
        "connectedAs": "Conectado: {0}",
        "notAuthorizedHint": "No autorizado (solo la lista pública está disponible)",
        "chartTitle": "Lista de éxitos de Yandex",
        "playlistsTitle": "Listas de reproducción",
        "loadingTracks": "Cargando pistas...",
        "downloadingTrack": "Descargando: «{0}»...",
        "downloadSuccess": "¡«{0}» descargado correctamente!",
        "downloadError": "Error de descarga: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Buscar canciones y vídeos en YouTube Music",
        "searchBtn": "Buscar",
        "ytSearching": "Buscando en YouTube...",
        "ytEnterQueryHint": "Escriba el nombre de la pista o artista para buscar",
        "nothingFound": "No se encontró nada",
        "tryDifferentQuery": "Pruebe con otra búsqueda",
        "settingsSectionDownload": "Carpeta de descargas",
        "settingsDownloadDesc": "Directorio para guardar música de Yandex Music y YouTube Music:",
        "settingsNotSelected": "No seleccionada",
        "selectFolderBtn": "Seleccionar carpeta",
        "downloadFolderUpdated": "¡Carpeta de descargas actualizada!",
        "settingsSectionLibrary": "Carpetas de música (Biblioteca)",
        "selectAndAddFolderBtn": "Seleccionar y añadir carpeta",
        "folderAddedSuccess": "¡Carpeta añadida con éxito!",
        "noAddedFolders": "No hay carpetas añadidas",
        "autoScanNotice": "La carpeta ~/Music y las tarjetas microSD se analizan automáticamente.",
        "modalTitleDownload": "Seleccionar carpeta de descargas",
        "modalTitleLibrary": "Seleccionar carpeta de música",
        "modalHeaderDownload": "Elija la carpeta para guardar canciones",
        "modalHeaderLibrary": "Elija la carpeta para añadir a la biblioteca",
        "quickSelect": "Acceso rápido:",
        "currentFolder": "Carpeta actual:",
        "upBtn": "Subir",
        "selectThisFolderBtn": "Seleccionar esta carpeta",
        "foldersList": "Carpetas:",
        "noSubfolders": "No hay subcarpetas",
        "loading": "Cargando...",
        "languageSettingTitle": "Idioma de la interfaz",
        "languageSettingDesc": "Idioma de la aplicación (por defecto el idioma de Steam):",
        "languageAuto": "Auto (Idioma de Steam)",
        "aboutTagline": "Reproductor de música con streaming y descargas diseñado para Decky Loader Russia",
        "featuresTitle": "Características del plugin",
        "featBackgroundTitle": "Reproducción en segundo plano",
        "featBackgroundDesc": "La música suena junto con cualquier juego en Game Mode sin pérdida de rendimiento.",
        "featLocalTitle": "Biblioteca local",
        "featLocalDesc": "Escaneo de memoria interna y microSD (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "Música VK",
        "featVkDesc": "Integración con VKontakte: búsqueda, streaming y descarga (en desarrollo).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Streaming, sincronización de listas y el Top-50.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Búsqueda rápida global de canciones, artistas y álbumes.",
        "featDownloadTitle": "Descarga en el dispositivo",
        "featDownloadDesc": "Guarde pistas de Yandex y YouTube Music en formato MP3 con carátulas y etiquetas.",
        "techInfoTitle": "Detalles técnicos",
        "techAudioEngine": "Motor de audio:",
        "techInterface": "Interfaz:",
        "techConversion": "Conversión de audio:",
        "techCreatedFor": "Creado para Decky Loader Russia (deckyloader.ru)"
    },
    "es-419": {
        "tabPlayer": "Reproductor",
        "tabLocal": "Mi música",
        "tabVk": "Música VK",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Ajustes",
        "tabAbout": "Acerca de",
        "openLibrary": "Abrir biblioteca",
        "shuffle": "Aleatorio",
        "repeatOff": "Repetir: no",
        "repeatAll": "Repetir todo",
        "repeatOne": "Repetir 1",
        "statusPlaying": "Reproduciendo",
        "statusPaused": "Pausa",
        "statusStopped": "Detenido",
        "noTrackSelected": "Ninguna pista seleccionada",
        "selectSongHint": "Seleccione una canción en el menú izquierdo",
        "clickOpenLibraryHint": "Haga clic en «Abrir biblioteca»",
        "albumPrefix": "Álbum: ",
        "volLabel": "Vol.",
        "unmute": "Activar sonido",
        "mute": "Silenciar",
        "sourceVk": "Música VK",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Archivo local",
        "nowPlayingHeader": "En reproducción",
        "repeatMode1": "1",
        "repeatModeAll": "Todo",
        "repeatModeOff": "Desact.",
        "localSectionTitle": "Música local",
        "searchTracksPlaceholder": "Buscar pistas",
        "refreshBtn": "Actualizar",
        "searchingBtn": "Buscando...",
        "tracksFound": "Pistas encontradas: {0}",
        "musicNotFound": "No se encontró música.",
        "musicNotFoundHint": "Añada carpetas en «Ajustes» o coloque archivos en ~/Music.",
        "unknownArtist": "Artista desconocido",
        "vkSectionTitle": "Música VK",
        "inDevelopmentBadge": "En desarrollo",
        "vkBannerTitle": "Esta sección está en desarrollo",
        "vkBannerDesc": "Una actualización futura incluirá búsqueda, reproducción y descarga desde VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Autorización",
        "authDesc": "Inicie sesión con el token de Yandex Music para acceder a su biblioteca.",
        "tokenFieldLabel": "Token de cuenta Yandex",
        "loginBtn": "Entrar",
        "logoutBtn": "Salir",
        "connectedAs": "Conectado: {0}",
        "notAuthorizedHint": "No autorizado (solo la lista pública está disponible)",
        "chartTitle": "Lista de éxitos de Yandex",
        "playlistsTitle": "Listas de reproducción",
        "loadingTracks": "Cargando pistas...",
        "downloadingTrack": "Descargando: «{0}»...",
        "downloadSuccess": "¡«{0}» descargado correctamente!",
        "downloadError": "Error de descarga: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Buscar canciones y vídeos en YouTube Music",
        "searchBtn": "Buscar",
        "ytSearching": "Buscando en YouTube...",
        "ytEnterQueryHint": "Escriba el nombre de la pista o artista para buscar",
        "nothingFound": "No se encontró nada",
        "tryDifferentQuery": "Pruebe con otra búsqueda",
        "settingsSectionDownload": "Carpeta de descargas",
        "settingsDownloadDesc": "Directorio para guardar música de Yandex Music y YouTube Music:",
        "settingsNotSelected": "No seleccionada",
        "selectFolderBtn": "Seleccionar carpeta",
        "downloadFolderUpdated": "¡Carpeta de descargas actualizada!",
        "settingsSectionLibrary": "Carpetas de música (Biblioteca)",
        "selectAndAddFolderBtn": "Seleccionar y añadir carpeta",
        "folderAddedSuccess": "¡Carpeta añadida con éxito!",
        "noAddedFolders": "No hay carpetas añadidas",
        "autoScanNotice": "La carpeta ~/Music y las tarjetas microSD se analizan automáticamente.",
        "modalTitleDownload": "Seleccionar carpeta de descargas",
        "modalTitleLibrary": "Seleccionar carpeta de música",
        "modalHeaderDownload": "Elija la carpeta para guardar canciones",
        "modalHeaderLibrary": "Elija la carpeta para añadir a la biblioteca",
        "quickSelect": "Acceso rápido:",
        "currentFolder": "Carpeta actual:",
        "upBtn": "Subir",
        "selectThisFolderBtn": "Seleccionar esta carpeta",
        "foldersList": "Carpetas:",
        "noSubfolders": "No hay subcarpetas",
        "loading": "Cargando...",
        "languageSettingTitle": "Idioma de la interfaz",
        "languageSettingDesc": "Idioma de la aplicación (por defecto el idioma de Steam):",
        "languageAuto": "Auto (Idioma de Steam)",
        "aboutTagline": "Reproductor de música con streaming y descargas diseñado para Decky Loader Russia",
        "featuresTitle": "Características del plugin",
        "featBackgroundTitle": "Reproducción en segundo plano",
        "featBackgroundDesc": "La música suena junto con cualquier juego en Game Mode sin pérdida de rendimiento.",
        "featLocalTitle": "Biblioteca local",
        "featLocalDesc": "Escaneo de memoria interna y microSD (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "Música VK",
        "featVkDesc": "Integración con VKontakte: búsqueda, streaming y descarga (en desarrollo).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Streaming, sincronización de listas y el Top-50.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Búsqueda rápida global de canciones, artistas y álbumes.",
        "featDownloadTitle": "Descarga en el dispositivo",
        "featDownloadDesc": "Guarde pistas de Yandex y YouTube Music en formato MP3 con carátulas y etiquetas.",
        "techInfoTitle": "Detalles técnicos",
        "techAudioEngine": "Motor de audio:",
        "techInterface": "Interfaz:",
        "techConversion": "Conversión de audio:",
        "techCreatedFor": "Creado para Decky Loader Russia (deckyloader.ru)"
    },
    "it": {
        "tabPlayer": "Lettore",
        "tabLocal": "La mia musica",
        "tabVk": "Musica VK",
        "tabYandex": "Yandex Musica",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Impostazioni",
        "tabAbout": "Informazioni",
        "openLibrary": "Apri libreria",
        "shuffle": "Casuale",
        "repeatOff": "Ripeti disatt.",
        "repeatAll": "Ripeti tutto",
        "repeatOne": "Ripeti 1",
        "statusPlaying": "In riproduzione",
        "statusPaused": "In pausa",
        "statusStopped": "Fermato",
        "noTrackSelected": "Nessun brano selezionato",
        "selectSongHint": "Seleziona un brano dal menu a sinistra",
        "clickOpenLibraryHint": "Premi «Apri libreria»",
        "albumPrefix": "Album: ",
        "volLabel": "Vol.",
        "unmute": "Riattiva audio",
        "mute": "Disattiva audio",
        "sourceVk": "Musica VK",
        "sourceYandex": "Yandex Musica",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "File locale",
        "nowPlayingHeader": "In riproduzione",
        "repeatMode1": "1",
        "repeatModeAll": "Tutto",
        "repeatModeOff": "Disatt.",
        "localSectionTitle": "Musica locale",
        "searchTracksPlaceholder": "Cerca brani",
        "refreshBtn": "Aggiorna",
        "searchingBtn": "Ricerca...",
        "tracksFound": "Brani trovati: {0}",
        "musicNotFound": "Nessuna musica trovata.",
        "musicNotFoundHint": "Aggiungi cartelle in «Impostazioni» o metti i file in ~/Music.",
        "unknownArtist": "Artista sconosciuto",
        "vkSectionTitle": "Musica VK",
        "inDevelopmentBadge": "In sviluppo",
        "vkBannerTitle": "Questa sezione è in fase di sviluppo",
        "vkBannerDesc": "Un futuro aggiornamento introdurrà ricerca, riproduzione e download da VKontakte.",
        "yandexSectionTitle": "Yandex Musica",
        "authHeader": "Autenticazione",
        "authDesc": "Accedi tramite token Yandex per visualizzare la tua libreria.",
        "tokenFieldLabel": "Token account Yandex",
        "loginBtn": "Accedi",
        "logoutBtn": "Esci",
        "connectedAs": "Connesso: {0}",
        "notAuthorizedHint": "Non autenticato (è disponibile solo la classifica pubblica)",
        "chartTitle": "Classifica Yandex Musica",
        "playlistsTitle": "Playlist",
        "loadingTracks": "Caricamento brani...",
        "downloadingTrack": "Scaricamento: «{0}»...",
        "downloadSuccess": "«{0}» scaricato con successo!",
        "downloadError": "Errore di download: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Cerca brani e video su YouTube Music",
        "searchBtn": "Cerca",
        "ytSearching": "Ricerca su YouTube...",
        "ytEnterQueryHint": "Inserisci il nome del brano o artista da cercare",
        "nothingFound": "Nessun risultato",
        "tryDifferentQuery": "Prova una ricerca diversa",
        "settingsSectionDownload": "Cartella di download",
        "settingsDownloadDesc": "Percorso per salvare musica da Yandex e YouTube Music:",
        "settingsNotSelected": "Non selezionata",
        "selectFolderBtn": "Scegli cartella",
        "downloadFolderUpdated": "Cartella di download aggiornata!",
        "settingsSectionLibrary": "Cartelle musicali (Libreria)",
        "selectAndAddFolderBtn": "Scegli e aggiungi cartella",
        "folderAddedSuccess": "Cartella aggiunta con successo!",
        "noAddedFolders": "Nessuna cartella aggiunta",
        "autoScanNotice": "La cartella ~/Music e le schede microSD vengono scansionate automaticamente.",
        "modalTitleDownload": "Seleziona cartella download",
        "modalTitleLibrary": "Seleziona cartella musica",
        "modalHeaderDownload": "Scegli dove salvare i brani scaricati",
        "modalHeaderLibrary": "Scegli la cartella da aggiungere",
        "quickSelect": "Selezione rapida:",
        "currentFolder": "Cartella corrente:",
        "upBtn": "Su",
        "selectThisFolderBtn": "Seleziona questa cartella",
        "foldersList": "Cartelle:",
        "noSubfolders": "Nessuna sottocartella",
        "loading": "Caricamento...",
        "languageSettingTitle": "Lingua interfaccia",
        "languageSettingDesc": "Lingua dell'applicazione (predefinita: lingua di sistema Steam):",
        "languageAuto": "Auto (Lingua Steam)",
        "aboutTagline": "Lettore musicale con streaming e download progettato per Decky Loader Russia",
        "featuresTitle": "Funzionalità",
        "featBackgroundTitle": "Riproduzione in background",
        "featBackgroundDesc": "La musica suona mentre giochi in Game Mode senza cali di prestazioni.",
        "featLocalTitle": "Libreria locale",
        "featLocalDesc": "Scansione memoria interna e schede microSD (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "Musica VK",
        "featVkDesc": "Integrazione con VKontakte: ricerca, ascolto e download (in sviluppo).",
        "featYandexTitle": "Yandex Musica",
        "featYandexDesc": "Streaming, sincronizzazione playlist e Top-50.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Ricerca globale veloce di brani, artisti e album.",
        "featDownloadTitle": "Download sul dispositivo",
        "featDownloadDesc": "Salva brani in MP3 con tag e copertine per l'ascolto offline.",
        "techInfoTitle": "Informazioni tecniche",
        "techAudioEngine": "Motore audio:",
        "techInterface": "Interfaccia utente:",
        "techConversion": "Conversione audio:",
        "techCreatedFor": "Creato per Decky Loader Russia (deckyloader.ru)"
    },
    "pt-BR": {
        "tabPlayer": "Reprodutor",
        "tabLocal": "Minhas Músicas",
        "tabVk": "Música VK",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Configurações",
        "tabAbout": "Sobre",
        "openLibrary": "Abrir Biblioteca",
        "shuffle": "Aleatório",
        "repeatOff": "Repetir desat.",
        "repeatAll": "Repetir tudo",
        "repeatOne": "Repetir 1",
        "statusPlaying": "Reproduzindo",
        "statusPaused": "Pausado",
        "statusStopped": "Parado",
        "noTrackSelected": "Nenhuma faixa selecionada",
        "selectSongHint": "Escolha uma música no menu à esquerda",
        "clickOpenLibraryHint": "Clique em «Abrir Biblioteca»",
        "albumPrefix": "Álbum: ",
        "volLabel": "Vol.",
        "unmute": "Ativar som",
        "mute": "Mudo",
        "sourceVk": "Música VK",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Arquivo local",
        "nowPlayingHeader": "Tocando agora",
        "repeatMode1": "1",
        "repeatModeAll": "Tudo",
        "repeatModeOff": "Desat.",
        "localSectionTitle": "Música local",
        "searchTracksPlaceholder": "Buscar faixas",
        "refreshBtn": "Atualizar",
        "searchingBtn": "Buscando...",
        "tracksFound": "Faixas encontradas: {0}",
        "musicNotFound": "Nenhuma música encontrada.",
        "musicNotFoundHint": "Adicione pastas em «Configurações» ou coloque arquivos em ~/Music.",
        "unknownArtist": "Artista desconhecido",
        "vkSectionTitle": "Música VK",
        "inDevelopmentBadge": "Em desenvolvimento",
        "vkBannerTitle": "Esta seção está em desenvolvimento",
        "vkBannerDesc": "Uma atualização futura trará busca, reprodução e download do VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Autorização",
        "authDesc": "Faça login com o token do Yandex Music para acessar sua biblioteca.",
        "tokenFieldLabel": "Token da conta Yandex",
        "loginBtn": "Entrar",
        "logoutBtn": "Sair",
        "connectedAs": "Conectado: {0}",
        "notAuthorizedHint": "Não autorizado (apenas a parada pública está disponível)",
        "chartTitle": "Paradas do Yandex Music",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Carregando faixas...",
        "downloadingTrack": "Baixando: «{0}»...",
        "downloadSuccess": "«{0}» baixado com sucesso!",
        "downloadError": "Erro de download: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Buscar faixas e vídeos no YouTube Music",
        "searchBtn": "Buscar",
        "ytSearching": "Buscando no YouTube...",
        "ytEnterQueryHint": "Digite o nome da faixa ou artista para buscar",
        "nothingFound": "Nada encontrado",
        "tryDifferentQuery": "Tente uma busca diferente",
        "settingsSectionDownload": "Pasta de downloads",
        "settingsDownloadDesc": "Diretório para salvar músicas do Yandex Music e YouTube Music:",
        "settingsNotSelected": "Não selecionada",
        "selectFolderBtn": "Selecionar pasta",
        "downloadFolderUpdated": "Pasta de downloads atualizada com sucesso!",
        "settingsSectionLibrary": "Pastas de música (Biblioteca)",
        "selectAndAddFolderBtn": "Selecionar e adicionar pasta",
        "folderAddedSuccess": "Pasta adicionada com sucesso!",
        "noAddedFolders": "Nenhuma pasta adicionada",
        "autoScanNotice": "A pasta ~/Music e cartões microSD são verificados automaticamente.",
        "modalTitleDownload": "Selecionar pasta de download",
        "modalTitleLibrary": "Selecionar pasta de música",
        "modalHeaderDownload": "Escolha a pasta para salvar as músicas",
        "modalHeaderLibrary": "Escolha a pasta para adicionar à biblioteca",
        "quickSelect": "Seleção rápida:",
        "currentFolder": "Pasta atual:",
        "upBtn": "Acima",
        "selectThisFolderBtn": "Selecionar esta pasta",
        "foldersList": "Pastas:",
        "noSubfolders": "Sem subpastas",
        "loading": "Carregando...",
        "languageSettingTitle": "Idioma da interface",
        "languageSettingDesc": "Idioma do aplicativo (padrão do sistema Steam):",
        "languageAuto": "Automático (Idioma do Steam)",
        "aboutTagline": "Reprodutor de música com streaming e downloads projetado para o Decky Loader Russia",
        "featuresTitle": "Recursos do plugin",
        "featBackgroundTitle": "Reprodução em segundo plano",
        "featBackgroundDesc": "A música toca junto com qualquer jogo no Game Mode sem perda de desempenho.",
        "featLocalTitle": "Biblioteca local",
        "featLocalDesc": "Verificação de armazenamento interno e microSD (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "Música VK",
        "featVkDesc": "Integração VKontakte: busca, streaming e download (em desenvolvimento).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Streaming, sincronização de playlists e Top-50.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Busca rápida e global por faixas, artistas e álbuns.",
        "featDownloadTitle": "Download no dispositivo",
        "featDownloadDesc": "Salve músicas em MP3 com tags e capas para ouvir offline.",
        "techInfoTitle": "Informações técnicas",
        "techAudioEngine": "Motor de áudio:",
        "techInterface": "Interface:",
        "techConversion": "Conversão de áudio:",
        "techCreatedFor": "Criado para Decky Loader Russia (deckyloader.ru)"
    },
    "pt": {
        "tabPlayer": "Reprodutor",
        "tabLocal": "Minhas Músicas",
        "tabVk": "Música VK",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Configurações",
        "tabAbout": "Sobre",
        "openLibrary": "Abrir Biblioteca",
        "shuffle": "Aleatório",
        "repeatOff": "Repetir desat.",
        "repeatAll": "Repetir tudo",
        "repeatOne": "Repetir 1",
        "statusPlaying": "Reproduzindo",
        "statusPaused": "Pausado",
        "statusStopped": "Parado",
        "noTrackSelected": "Nenhuma faixa selecionada",
        "selectSongHint": "Escolha uma música no menu à esquerda",
        "clickOpenLibraryHint": "Clique em «Abrir Biblioteca»",
        "albumPrefix": "Álbum: ",
        "volLabel": "Vol.",
        "unmute": "Ativar som",
        "mute": "Mudo",
        "sourceVk": "Música VK",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Arquivo local",
        "nowPlayingHeader": "Tocando agora",
        "repeatMode1": "1",
        "repeatModeAll": "Tudo",
        "repeatModeOff": "Desat.",
        "localSectionTitle": "Música local",
        "searchTracksPlaceholder": "Buscar faixas",
        "refreshBtn": "Atualizar",
        "searchingBtn": "Buscando...",
        "tracksFound": "Faixas encontradas: {0}",
        "musicNotFound": "Nenhuma música encontrada.",
        "musicNotFoundHint": "Adicione pastas em «Configurações» ou coloque arquivos em ~/Music.",
        "unknownArtist": "Artista desconhecido",
        "vkSectionTitle": "Música VK",
        "inDevelopmentBadge": "Em desenvolvimento",
        "vkBannerTitle": "Esta seção está em desenvolvimento",
        "vkBannerDesc": "Uma atualização futura trará busca, reprodução e download do VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Autorização",
        "authDesc": "Faça login com o token do Yandex Music para acessar sua biblioteca.",
        "tokenFieldLabel": "Token da conta Yandex",
        "loginBtn": "Entrar",
        "logoutBtn": "Sair",
        "connectedAs": "Conectado: {0}",
        "notAuthorizedHint": "Não autorizado (apenas a parada pública está disponível)",
        "chartTitle": "Paradas do Yandex Music",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Carregando faixas...",
        "downloadingTrack": "Baixando: «{0}»...",
        "downloadSuccess": "«{0}» baixado com sucesso!",
        "downloadError": "Erro de download: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Buscar faixas e vídeos no YouTube Music",
        "searchBtn": "Buscar",
        "ytSearching": "Buscando no YouTube...",
        "ytEnterQueryHint": "Digite o nome da faixa ou artista para buscar",
        "nothingFound": "Nada encontrado",
        "tryDifferentQuery": "Tente uma busca diferente",
        "settingsSectionDownload": "Pasta de downloads",
        "settingsDownloadDesc": "Diretório para salvar músicas do Yandex Music e YouTube Music:",
        "settingsNotSelected": "Não selecionada",
        "selectFolderBtn": "Selecionar pasta",
        "downloadFolderUpdated": "Pasta de downloads atualizada com sucesso!",
        "settingsSectionLibrary": "Pastas de música (Biblioteca)",
        "selectAndAddFolderBtn": "Selecionar e adicionar pasta",
        "folderAddedSuccess": "Pasta adicionada com sucesso!",
        "noAddedFolders": "Nenhuma pasta adicionada",
        "autoScanNotice": "A pasta ~/Music e cartões microSD são verificados automaticamente.",
        "modalTitleDownload": "Selecionar pasta de download",
        "modalTitleLibrary": "Selecionar pasta de música",
        "modalHeaderDownload": "Escolha a pasta para salvar as músicas",
        "modalHeaderLibrary": "Escolha a pasta para adicionar à biblioteca",
        "quickSelect": "Seleção rápida:",
        "currentFolder": "Pasta atual:",
        "upBtn": "Acima",
        "selectThisFolderBtn": "Selecionar esta pasta",
        "foldersList": "Pastas:",
        "noSubfolders": "Sem subpastas",
        "loading": "Carregando...",
        "languageSettingTitle": "Idioma da interface",
        "languageSettingDesc": "Idioma do aplicativo (padrão do sistema Steam):",
        "languageAuto": "Automático (Idioma do Steam)",
        "aboutTagline": "Reprodutor de música com streaming e downloads projetado para o Decky Loader Russia",
        "featuresTitle": "Recursos do plugin",
        "featBackgroundTitle": "Reprodução em segundo plano",
        "featBackgroundDesc": "A música toca junto com qualquer jogo no Game Mode sem perda de desempenho.",
        "featLocalTitle": "Biblioteca local",
        "featLocalDesc": "Verificação de armazenamento interno e microSD (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "Música VK",
        "featVkDesc": "Integração VKontakte: busca, streaming e download (em desenvolvimento).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Streaming, sincronização de playlists e Top-50.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Busca rápida e global por faixas, artistas e álbuns.",
        "featDownloadTitle": "Download no dispositivo",
        "featDownloadDesc": "Salve músicas em MP3 com tags e capas para ouvir offline.",
        "techInfoTitle": "Informações técnicas",
        "techAudioEngine": "Motor de áudio:",
        "techInterface": "Interface:",
        "techConversion": "Conversão de áudio:",
        "techCreatedFor": "Criado para Decky Loader Russia (deckyloader.ru)"
    },
    "pl": {
        "tabPlayer": "Odtwarzacz",
        "tabLocal": "Moja muzyka",
        "tabVk": "VK Muzyka",
        "tabYandex": "Yandex Muzyka",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Ustawienia",
        "tabAbout": "O wtyczce",
        "openLibrary": "Otwórz bibliotekę",
        "shuffle": "Losowo",
        "repeatOff": "Powtarzanie wył.",
        "repeatAll": "Powtórz wszystko",
        "repeatOne": "Powtórz 1",
        "statusPlaying": "Odtwarzanie",
        "statusPaused": "Pauza",
        "statusStopped": "Zatrzymano",
        "noTrackSelected": "Nie wybrano utworu",
        "selectSongHint": "Wybierz utwór z menu po lewej stronie",
        "clickOpenLibraryHint": "Kliknij «Otwórz bibliotekę»",
        "albumPrefix": "Album: ",
        "volLabel": "Głośn.",
        "unmute": "Włącz dźwięk",
        "mute": "Wycisz",
        "sourceVk": "VK Muzyka",
        "sourceYandex": "Yandex Muzyka",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Plik lokalny",
        "nowPlayingHeader": "Teraz odtwarzane",
        "repeatMode1": "1",
        "repeatModeAll": "Wszystko",
        "repeatModeOff": "Wył.",
        "localSectionTitle": "Lokalna muzyka",
        "searchTracksPlaceholder": "Szukaj utworów",
        "refreshBtn": "Odśwież",
        "searchingBtn": "Szukanie...",
        "tracksFound": "Znaleziono utworów: {0}",
        "musicNotFound": "Nie znaleziono muzyki.",
        "musicNotFoundHint": "Dodaj foldery w «Ustawieniach» lub umieść pliki w ~/Music.",
        "unknownArtist": "Nieznany wykonawca",
        "vkSectionTitle": "VK Muzyka",
        "inDevelopmentBadge": "W fazie rozwoju",
        "vkBannerTitle": "Ta sekcja jest w fazie rozwoju",
        "vkBannerDesc": "Przyszła aktualizacja wprowadzi wyszukiwanie, odtwarzanie i pobieranie z VKontakte.",
        "yandexSectionTitle": "Yandex Muzyka",
        "authHeader": "Autoryzacja",
        "authDesc": "Zaloguj się tokenem Yandex Music, aby uzyskać dostęp do biblioteki.",
        "tokenFieldLabel": "Token konta Yandex",
        "loginBtn": "Zaloguj",
        "logoutBtn": "Wyloguj",
        "connectedAs": "Połączono: {0}",
        "notAuthorizedHint": "Brak autoryzacji (dostępne tylko listy publiczne)",
        "chartTitle": "Lista przebojów Yandex",
        "playlistsTitle": "Playlisty",
        "loadingTracks": "Ładowanie utworów...",
        "downloadingTrack": "Pobieranie: «{0}»...",
        "downloadSuccess": "«{0}» pomyślnie pobrano!",
        "downloadError": "Błąd pobierania: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Szukaj utworów i filmów w YouTube Music",
        "searchBtn": "Szukaj",
        "ytSearching": "Wyszukiwanie w YouTube...",
        "ytEnterQueryHint": "Wpisz nazwę utworu lub wykonawcy",
        "nothingFound": "Nic nie znaleziono",
        "tryDifferentQuery": "Spróbuj innego zapytania",
        "settingsSectionDownload": "Folder pobierania",
        "settingsDownloadDesc": "Katalog zapisu muzyki z Yandex Music i YouTube Music:",
        "settingsNotSelected": "Nie wybrano",
        "selectFolderBtn": "Wybierz folder",
        "downloadFolderUpdated": "Folder pobierania został zaktualizowany!",
        "settingsSectionLibrary": "Foldery z muzyką (Biblioteka)",
        "selectAndAddFolderBtn": "Wybierz i dodaj folder",
        "folderAddedSuccess": "Pomyślnie dodano folder!",
        "noAddedFolders": "Brak dodanych folderów",
        "autoScanNotice": "Folder ~/Music oraz karty microSD są skanowane automatycznie.",
        "modalTitleDownload": "Wybierz folder pobierania",
        "modalTitleLibrary": "Wybierz folder z muzyką",
        "modalHeaderDownload": "Wybierz folder do zapisu utworów",
        "modalHeaderLibrary": "Wybierz folder do dodania",
        "quickSelect": "Szybki wybór:",
        "currentFolder": "Bieżący folder:",
        "upBtn": "W górę",
        "selectThisFolderBtn": "Wybierz ten folder",
        "foldersList": "Foldery:",
        "noSubfolders": "Brak podfolderów",
        "loading": "Ładowanie...",
        "languageSettingTitle": "Język interfejsu",
        "languageSettingDesc": "Język aplikacji (domyślnie język systemu Steam):",
        "languageAuto": "Automatyczny (Język Steam)",
        "aboutTagline": "Odtwarzacz muzyczny ze streamingiem i pobieraniem stworzony dla Decky Loader Russia",
        "featuresTitle": "Funkcje wtyczki",
        "featBackgroundTitle": "Odtwarzanie w tle",
        "featBackgroundDesc": "Muzyka gra równolegle z grami w Game Mode bez utraty wydajności.",
        "featLocalTitle": "Lokalna biblioteka",
        "featLocalDesc": "Skanowanie pamięci wewnętrznej i kart microSD (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Muzyka",
        "featVkDesc": "Integracja z VKontakte: wyszukiwanie, odtwarzanie i pobieranie (w przygotowaniu).",
        "featYandexTitle": "Yandex Muzyka",
        "featYandexDesc": "Streaming, synchronizacja playlist i Top-50.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Szybkie wyszukiwanie utworów, artystów i albumów.",
        "featDownloadTitle": "Pobieranie na urządzenie",
        "featDownloadDesc": "Zapis utworów w formacie MP3 z tagami i okładkami do słuchania offline.",
        "techInfoTitle": "Informacje techniczne",
        "techAudioEngine": "Silnik audio:",
        "techInterface": "Interfejs:",
        "techConversion": "Konwersja audio:",
        "techCreatedFor": "Stworzono dla Decky Loader Russia (deckyloader.ru)"
    },
    "zh-CN": {
        "tabPlayer": "播放器",
        "tabLocal": "本地音乐",
        "tabVk": "VK 音乐",
        "tabYandex": "Yandex 音乐",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "设置",
        "tabAbout": "关于插件",
        "openLibrary": "打开媒体库",
        "shuffle": "随机播放",
        "repeatOff": "循环关闭",
        "repeatAll": "列表循环",
        "repeatOne": "单曲循环",
        "statusPlaying": "正在播放",
        "statusPaused": "已暂停",
        "statusStopped": "已停止",
        "noTrackSelected": "未选择歌曲",
        "selectSongHint": "请在左侧菜单中选择歌曲",
        "clickOpenLibraryHint": "点击 «打开媒体库»",
        "albumPrefix": "专辑: ",
        "volLabel": "音量",
        "unmute": "取消静音",
        "mute": "静音",
        "sourceVk": "VK 音乐",
        "sourceYandex": "Yandex 音乐",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "本地文件",
        "nowPlayingHeader": "正在播放",
        "repeatMode1": "单曲",
        "repeatModeAll": "全部",
        "repeatModeOff": "关",
        "localSectionTitle": "本地音乐",
        "searchTracksPlaceholder": "搜索歌曲",
        "refreshBtn": "刷新",
        "searchingBtn": "搜索中...",
        "tracksFound": "找到歌曲: {0}",
        "musicNotFound": "未找到音乐。",
        "musicNotFoundHint": "请在 «设置» 中添加文件夹，或将文件放入 ~/Music。",
        "unknownArtist": "未知艺术家",
        "vkSectionTitle": "VK 音乐",
        "inDevelopmentBadge": "开发中",
        "vkBannerTitle": "该功能正在开发中，敬请期待更新",
        "vkBannerDesc": "未来更新将支持 VKontakte 音乐的搜索、播放与下载。",
        "yandexSectionTitle": "Yandex 音乐",
        "authHeader": "授权登录",
        "authDesc": "使用 Yandex Music 令牌登录以访问您的媒体库。",
        "tokenFieldLabel": "Yandex 账号令牌",
        "loginBtn": "登录",
        "logoutBtn": "退出",
        "connectedAs": "已连接: {0}",
        "notAuthorizedHint": "未授权 (仅可访问公共排行榜)",
        "chartTitle": "Yandex 音乐排行榜",
        "playlistsTitle": "歌单",
        "loadingTracks": "正在加载歌曲...",
        "downloadingTrack": "正在下载: «{0}»...",
        "downloadSuccess": "«{0}» 已成功下载到下载文件夹！",
        "downloadError": "下载失败: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "在 YouTube Music 中搜索歌曲与视频",
        "searchBtn": "搜索",
        "ytSearching": "正在搜索 YouTube...",
        "ytEnterQueryHint": "请输入歌曲或艺术家名称",
        "nothingFound": "未找到任何内容",
        "tryDifferentQuery": "尝试更换搜索词",
        "settingsSectionDownload": "下载文件夹",
        "settingsDownloadDesc": "保存 Yandex 音乐和 YouTube Music 的目标目录:",
        "settingsNotSelected": "未选择",
        "selectFolderBtn": "选择文件夹",
        "downloadFolderUpdated": "下载文件夹已更新！",
        "settingsSectionLibrary": "音乐文件夹 (媒体库)",
        "selectAndAddFolderBtn": "选择并添加文件夹",
        "folderAddedSuccess": "文件夹添加成功！",
        "noAddedFolders": "未添加文件夹",
        "autoScanNotice": "~/Music 文件夹和连接的 microSD 卡将自动扫描。",
        "modalTitleDownload": "选择下载文件夹",
        "modalTitleLibrary": "选择音乐文件夹",
        "modalHeaderDownload": "选择保存下载歌曲的文件夹",
        "modalHeaderLibrary": "选择要添加到媒体库的文件夹",
        "quickSelect": "快速选择:",
        "currentFolder": "当前文件夹:",
        "upBtn": "上一级",
        "selectThisFolderBtn": "选择此文件夹",
        "foldersList": "文件夹列表:",
        "noSubfolders": "无子文件夹",
        "loading": "加载中...",
        "languageSettingTitle": "界面语言",
        "languageSettingDesc": "应用程序语言 (默认跟随 Steam 系统语言):",
        "languageAuto": "自动 (跟随 Steam)",
        "aboutTagline": "专为 Decky Loader Russia 打造的流媒体播放与下载音乐播放器",
        "featuresTitle": "插件功能",
        "featBackgroundTitle": "后台静默播放",
        "featBackgroundDesc": "在游戏模式下与任何游戏同时运行，毫无性能损失。",
        "featLocalTitle": "本地媒体库",
        "featLocalDesc": "扫描机身存储与 microSD 卡 (MP3, FLAC, M4A, OGG, WAV)。",
        "featVkTitle": "VK 音乐",
        "featVkDesc": "VKontakte 音乐集成: 搜索、播放在线音频与下载 (开发中)。",
        "featYandexTitle": "Yandex 音乐",
        "featYandexDesc": "流媒体播放、同步收藏歌单及 Top-50 热歌榜。",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "快速全局搜索单曲、歌手及专辑，支持历史记录。",
        "featDownloadTitle": "离线下载到设备",
        "featDownloadDesc": "将在线歌曲以 MP3 格式保存到设备，内嵌封面与元数据标签。",
        "techInfoTitle": "技术规格",
        "techAudioEngine": "音频引擎:",
        "techInterface": "用户界面:",
        "techConversion": "音频转换:",
        "techCreatedFor": "专为 Decky Loader Russia (deckyloader.ru) 打造"
    },
    "zh-TW": {
        "tabPlayer": "播放器",
        "tabLocal": "本機音樂",
        "tabVk": "VK 音乐",
        "tabYandex": "Yandex 音乐",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "設定",
        "tabAbout": "关于插件",
        "openLibrary": "開啟媒體庫",
        "shuffle": "随机播放",
        "repeatOff": "關閉循環",
        "repeatAll": "全部循環",
        "repeatOne": "單曲循環",
        "statusPlaying": "正在播放",
        "statusPaused": "已暂停",
        "statusStopped": "已停止",
        "noTrackSelected": "未选择歌曲",
        "selectSongHint": "請在左側選單中選擇歌曲",
        "clickOpenLibraryHint": "點擊 «開啟媒體庫»",
        "albumPrefix": "专辑: ",
        "volLabel": "音量",
        "unmute": "取消静音",
        "mute": "静音",
        "sourceVk": "VK 音乐",
        "sourceYandex": "Yandex 音乐",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "本地文件",
        "nowPlayingHeader": "正在播放",
        "repeatMode1": "单曲",
        "repeatModeAll": "全部",
        "repeatModeOff": "关",
        "localSectionTitle": "本地音乐",
        "searchTracksPlaceholder": "搜索歌曲",
        "refreshBtn": "刷新",
        "searchingBtn": "搜索中...",
        "tracksFound": "找到歌曲: {0}",
        "musicNotFound": "未找到音乐。",
        "musicNotFoundHint": "请在 «设置» 中添加文件夹，或将文件放入 ~/Music。",
        "unknownArtist": "未知艺术家",
        "vkSectionTitle": "VK 音乐",
        "inDevelopmentBadge": "开发中",
        "vkBannerTitle": "该功能正在开发中，敬请期待更新",
        "vkBannerDesc": "未来更新将支持 VKontakte 音乐的搜索、播放与下载。",
        "yandexSectionTitle": "Yandex 音乐",
        "authHeader": "授权登录",
        "authDesc": "使用 Yandex Music 令牌登录以访问您的媒体库。",
        "tokenFieldLabel": "Yandex 账号令牌",
        "loginBtn": "登录",
        "logoutBtn": "退出",
        "connectedAs": "已连接: {0}",
        "notAuthorizedHint": "未授权 (仅可访问公共排行榜)",
        "chartTitle": "Yandex 音乐排行榜",
        "playlistsTitle": "播放清單",
        "loadingTracks": "正在載入歌曲...",
        "downloadingTrack": "正在下載: «{0}»...",
        "downloadSuccess": "«{0}» 已成功下載到下載資料夾！",
        "downloadError": "下载失败: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "在 YouTube Music 中搜索歌曲与视频",
        "searchBtn": "搜索",
        "ytSearching": "正在搜索 YouTube...",
        "ytEnterQueryHint": "请输入歌曲或艺术家名称",
        "nothingFound": "未找到任何内容",
        "tryDifferentQuery": "尝试更换搜索词",
        "settingsSectionDownload": "下載資料夾",
        "settingsDownloadDesc": "保存 Yandex 音乐和 YouTube Music 的目标目录:",
        "settingsNotSelected": "未选择",
        "selectFolderBtn": "選取資料夾",
        "downloadFolderUpdated": "下载文件夹已更新！",
        "settingsSectionLibrary": "音乐文件夹 (媒体库)",
        "selectAndAddFolderBtn": "選取並新增資料夾",
        "folderAddedSuccess": "資料夾新增成功！",
        "noAddedFolders": "未添加文件夹",
        "autoScanNotice": "~/Music 文件夹和连接的 microSD 卡将自动扫描。",
        "modalTitleDownload": "选择下载文件夹",
        "modalTitleLibrary": "选择音乐文件夹",
        "modalHeaderDownload": "选择保存下载歌曲的文件夹",
        "modalHeaderLibrary": "选择要添加到媒体库的文件夹",
        "quickSelect": "快速选择:",
        "currentFolder": "当前文件夹:",
        "upBtn": "上一级",
        "selectThisFolderBtn": "选择此文件夹",
        "foldersList": "文件夹列表:",
        "noSubfolders": "无子文件夹",
        "loading": "加载中...",
        "languageSettingTitle": "介面語言",
        "languageSettingDesc": "應用程式語言 (預設跟隨 Steam 系統語言):",
        "languageAuto": "自動 (跟隨 Steam)",
        "aboutTagline": "专为 Decky Loader Russia 打造的流媒体播放与下载音乐播放器",
        "featuresTitle": "插件功能",
        "featBackgroundTitle": "后台静默播放",
        "featBackgroundDesc": "在游戏模式下与任何游戏同时运行，毫无性能损失。",
        "featLocalTitle": "本地媒体库",
        "featLocalDesc": "扫描机身存储与 microSD 卡 (MP3, FLAC, M4A, OGG, WAV)。",
        "featVkTitle": "VK 音乐",
        "featVkDesc": "VKontakte 音乐集成: 搜索、播放在线音频与下载 (开发中)。",
        "featYandexTitle": "Yandex 音乐",
        "featYandexDesc": "流媒体播放、同步收藏歌单及 Top-50 热歌榜。",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "快速全局搜索单曲、歌手及专辑，支持历史记录。",
        "featDownloadTitle": "离线下载到设备",
        "featDownloadDesc": "将在线歌曲以 MP3 格式保存到设备，内嵌封面与元数据标签。",
        "techInfoTitle": "技术规格",
        "techAudioEngine": "音频引擎:",
        "techInterface": "用户界面:",
        "techConversion": "音频转换:",
        "techCreatedFor": "专为 Decky Loader Russia (deckyloader.ru) 打造"
    },
    "ja": {
        "tabPlayer": "プレーヤー",
        "tabLocal": "マイミュージック",
        "tabVk": "VK ミュージック",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "設定",
        "tabAbout": "情報",
        "openLibrary": "ライブラリを開く",
        "shuffle": "シャッフル",
        "repeatOff": "リピートオフ",
        "repeatAll": "全曲リピート",
        "repeatOne": "1曲リピート",
        "statusPlaying": "再生中",
        "statusPaused": "一時停止",
        "statusStopped": "停止中",
        "noTrackSelected": "曲が選択されていません",
        "selectSongHint": "左側のメニューから曲を選択してください",
        "clickOpenLibraryHint": "«ライブラリを開く» を押してください",
        "albumPrefix": "アルバム: ",
        "volLabel": "音量",
        "unmute": "ミュート解除",
        "mute": "ミュート",
        "sourceVk": "VK ミュージック",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "ローカルファイル",
        "nowPlayingHeader": "再生中",
        "repeatMode1": "1曲",
        "repeatModeAll": "全て",
        "repeatModeOff": "オフ",
        "localSectionTitle": "ローカルミュージック",
        "searchTracksPlaceholder": "曲を検索",
        "refreshBtn": "更新",
        "searchingBtn": "検索中...",
        "tracksFound": "見つかった曲: {0}",
        "musicNotFound": "音楽が見つかりません。",
        "musicNotFoundHint": "«設定» からフォルダを追加するか、~/Music に配置してください。",
        "unknownArtist": "不明なアーティスト",
        "vkSectionTitle": "VK ミュージック",
        "inDevelopmentBadge": "開発中",
        "vkBannerTitle": "この機能は現在開発中です。アップデートをお待ちください",
        "vkBannerDesc": "今後のアップデートで VKontakte からの検索、再生、ダウンロードが追加されます。",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "認証",
        "authDesc": "Yandex Music のトークンでログインし、ライブラリにアクセスします。",
        "tokenFieldLabel": "Yandex アカウントトークン",
        "loginBtn": "ログイン",
        "logoutBtn": "ログアウト",
        "connectedAs": "接続中: {0}",
        "notAuthorizedHint": "未認証 (公開チャートのみ利用可能)",
        "chartTitle": "Yandex チャート",
        "playlistsTitle": "プレイリスト",
        "loadingTracks": "読み込み中...",
        "downloadingTrack": "ダウンロード中: «{0}»...",
        "downloadSuccess": "«{0}» をダウンロードしました！",
        "downloadError": "ダウンロードエラー: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "YouTube Music の曲や動画を検索",
        "searchBtn": "検索",
        "ytSearching": "YouTube を検索中...",
        "ytEnterQueryHint": "曲名またはアーティスト名を入力してください",
        "nothingFound": "見つかりませんでした",
        "tryDifferentQuery": "別の検索語をお試しください",
        "settingsSectionDownload": "ダウンロード先フォルダ",
        "settingsDownloadDesc": "ダウンロードした曲を保存するディレクトリ:",
        "settingsNotSelected": "未選択",
        "selectFolderBtn": "フォルダを選択",
        "downloadFolderUpdated": "ダウンロード先を更新しました！",
        "settingsSectionLibrary": "音楽フォルダ (ライブラリ)",
        "selectAndAddFolderBtn": "フォルダを選択して追加",
        "folderAddedSuccess": "フォルダを追加しました！",
        "noAddedFolders": "追加されたフォルダはありません",
        "autoScanNotice": "~/Music フォルダと microSD カードは自動的にスキャンされます。",
        "modalTitleDownload": "ダウンロード先を選択",
        "modalTitleLibrary": "音楽フォルダを選択",
        "modalHeaderDownload": "保存先フォルダを選択してください",
        "modalHeaderLibrary": "ライブラリに追加するフォルダを選択してください",
        "quickSelect": "クイック選択:",
        "currentFolder": "現在のフォルダ:",
        "upBtn": "上へ",
        "selectThisFolderBtn": "このフォルダを選択",
        "foldersList": "フォルダ:",
        "noSubfolders": "サブフォルダがありません",
        "loading": "読み込み中...",
        "languageSettingTitle": "インターフェース言語",
        "languageSettingDesc": "言語設定 (デフォルト: Steam のシステム言語):",
        "languageAuto": "自動 (Steam 言語)",
        "aboutTagline": "Decky Loader Russia のために設計されたストリーミング＆ダウンロード音楽プレーヤー",
        "featuresTitle": "プラグインの機能",
        "featBackgroundTitle": "バックグラウンド再生",
        "featBackgroundDesc": "ゲームモードでゲームをプレイしながらパフォーマンス低下なく音楽を楽しめます。",
        "featLocalTitle": "ローカルライブラリ",
        "featLocalDesc": "内蔵ストレージと microSD (MP3, FLAC, M4A, OGG, WAV) をスキャン。",
        "featVkTitle": "VK ミュージック",
        "featVkDesc": "VKontakte 連携: 検索、再生、ダウンロード (開発中)。",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "ストリーミング、プレイリスト同期、Top-50 チャート。",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "曲、アーティスト、アルバムの高速グローバル検索。",
        "featDownloadTitle": "デバイスにダウンロード",
        "featDownloadDesc": "タグやカバーアート付きの MP3 形式でオフライン再生用に保存。",
        "techInfoTitle": "技術仕様",
        "techAudioEngine": "オーディオエンジン:",
        "techInterface": "UI:",
        "techConversion": "オーディオ変換:",
        "techCreatedFor": "Decky Loader Russia (deckyloader.ru) 向けに作成"
    },
    "ko": {
        "tabPlayer": "플레이어",
        "tabLocal": "내 음악",
        "tabVk": "VK 뮤직",
        "tabYandex": "Yandex 뮤직",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "설정",
        "tabAbout": "정보",
        "openLibrary": "라이브러리 열기",
        "shuffle": "셔플",
        "repeatOff": "반복 끔",
        "repeatAll": "전체 반복",
        "repeatOne": "한 곡 반복",
        "statusPlaying": "재생 중",
        "statusPaused": "일시 정지",
        "statusStopped": "정지됨",
        "noTrackSelected": "선택된 트랙 없음",
        "selectSongHint": "왼쪽 메뉴에서 노래를 선택하세요",
        "clickOpenLibraryHint": "«라이브러리 열기»를 누르세요",
        "albumPrefix": "앨범: ",
        "volLabel": "볼륨",
        "unmute": "음소거 해제",
        "mute": "음소거",
        "sourceVk": "VK 뮤직",
        "sourceYandex": "Yandex 뮤직",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "로컬 파일",
        "nowPlayingHeader": "현재 재생 중",
        "repeatMode1": "1곡",
        "repeatModeAll": "전체",
        "repeatModeOff": "끔",
        "localSectionTitle": "로컬 음악",
        "searchTracksPlaceholder": "트랙 검색",
        "refreshBtn": "새로고침",
        "searchingBtn": "검색 중...",
        "tracksFound": "찾은 트랙: {0}",
        "musicNotFound": "음악을 찾을 수 없습니다.",
        "musicNotFoundHint": "«설정»에서 폴더를 추가하거나 ~/Music에 파일을 넣으세요.",
        "unknownArtist": "알 수 없는 아티스트",
        "vkSectionTitle": "VK 뮤직",
        "inDevelopmentBadge": "개발 중",
        "vkBannerTitle": "이 섹션은 개발 중입니다. 다음 업데이트를 기대해 주세요",
        "vkBannerDesc": "향후 업데이트에서 VKontakte 검색, 재생 및 다운로드가 제공됩니다.",
        "yandexSectionTitle": "Yandex 뮤직",
        "authHeader": "인증",
        "authDesc": "라이브러리에 접근하려면 Yandex Music 토큰으로 로그인하세요.",
        "tokenFieldLabel": "Yandex 계정 토큰",
        "loginBtn": "로그인",
        "logoutBtn": "로그아웃",
        "connectedAs": "연결됨: {0}",
        "notAuthorizedHint": "인증되지 않음 (공개 차트만 이용 가능)",
        "chartTitle": "Yandex 뮤직 차트",
        "playlistsTitle": "재생목록",
        "loadingTracks": "트랙 불러오는 중...",
        "downloadingTrack": "다운로드 중: «{0}»...",
        "downloadSuccess": "«{0}» 다운로드 완료!",
        "downloadError": "다운로드 오류: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "YouTube Music에서 트랙 및 동영상 검색",
        "searchBtn": "검색",
        "ytSearching": "YouTube 검색 중...",
        "ytEnterQueryHint": "검색할 노래나 아티스트 이름을 입력하세요",
        "nothingFound": "결과 없음",
        "tryDifferentQuery": "다른 검색어로 시도해 보세요",
        "settingsSectionDownload": "다운로드 폴더",
        "settingsDownloadDesc": "음악을 저장할 디렉터리:",
        "settingsNotSelected": "선택되지 않음",
        "selectFolderBtn": "폴더 선택",
        "downloadFolderUpdated": "다운로드 폴더가 업데이트되었습니다!",
        "settingsSectionLibrary": "음악 폴더 (라이브러리)",
        "selectAndAddFolderBtn": "폴더 선택 및 추가",
        "folderAddedSuccess": "폴더가 성공적으로 추가되었습니다!",
        "noAddedFolders": "추가된 폴더 없음",
        "autoScanNotice": "~/Music 폴더와 microSD 카드는 자동으로 검색됩니다.",
        "modalTitleDownload": "다운로드 폴더 선택",
        "modalTitleLibrary": "음악 폴더 선택",
        "modalHeaderDownload": "다운로드 트랙을 저장할 폴더를 선택하세요",
        "modalHeaderLibrary": "라이브러리에 추가할 폴더를 선택하세요",
        "quickSelect": "빠른 선택:",
        "currentFolder": "현재 폴더:",
        "upBtn": "상위 폴더",
        "selectThisFolderBtn": "이 폴더 선택",
        "foldersList": "폴더 목록:",
        "noSubfolders": "하위 폴더 없음",
        "loading": "불러오는 중...",
        "languageSettingTitle": "인터페이스 언어",
        "languageSettingDesc": "애플리케이션 언어 (기본값: Steam 시스템 언어):",
        "languageAuto": "자동 (Steam 언어)",
        "aboutTagline": "Decky Loader Russia 전용 스트리밍 및 다운로드 음악 플레이어",
        "featuresTitle": "플러그인 기능",
        "featBackgroundTitle": "백그라운드 재생",
        "featBackgroundDesc": "게임 모드에서 성능 저하 없이 게임과 함께 음악을 즐길 수 있습니다.",
        "featLocalTitle": "로컬 라이브러리",
        "featLocalDesc": "내장 메모리 및 microSD 카드 스캔 (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK 뮤직",
        "featVkDesc": "VKontakte 음악 연동: 검색, 스트리밍, 다운로드 (개발 중).",
        "featYandexTitle": "Yandex 뮤직",
        "featYandexDesc": "트랙 스트리밍, 재생목록 동기화 및 Top-50 차트.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "트랙, 아티스트 및 앨범 빠른 글로벌 검색.",
        "featDownloadTitle": "기기에 다운로드",
        "featDownloadDesc": "오프라인 감상을 위해 태그와 앨범 커버가 포함된 MP3로 저장.",
        "techInfoTitle": "기술 사양",
        "techAudioEngine": "오디오 엔진:",
        "techInterface": "인터페이스:",
        "techConversion": "오디오 변환:",
        "techCreatedFor": "Decky Loader Russia (deckyloader.ru) 전용으로 제작됨"
    },
    "uk": {
        "tabPlayer": "Плеєр",
        "tabLocal": "Моя музика",
        "tabVk": "VK Музика",
        "tabYandex": "Яндекс Музика",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Налаштування",
        "tabAbout": "Про плагін",
        "openLibrary": "Відкрити бібліотеку",
        "shuffle": "Випадково",
        "repeatOff": "Повтор вимк",
        "repeatAll": "Повтор усіх",
        "repeatOne": "Повтор 1",
        "statusPlaying": "Грає",
        "statusPaused": "Пауза",
        "statusStopped": "Зупинено",
        "noTrackSelected": "Трек не вибрано",
        "selectSongHint": "Виберіть пісню на вкладці ліворуч",
        "clickOpenLibraryHint": "Натисніть «Відкрити бібліотеку»",
        "albumPrefix": "Альбом: ",
        "volLabel": "Гучн.",
        "unmute": "Увімкнути звук",
        "mute": "Вимкнути звук",
        "sourceVk": "VK Музика",
        "sourceYandex": "Яндекс Музика",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Локальний файл",
        "nowPlayingHeader": "Зараз грає",
        "repeatMode1": "1",
        "repeatModeAll": "Усі",
        "repeatModeOff": "Вимк",
        "localSectionTitle": "Локальна музика",
        "searchTracksPlaceholder": "Пошук треків",
        "refreshBtn": "Оновити",
        "searchingBtn": "Пошук...",
        "tracksFound": "Знайдено треків: {0}",
        "musicNotFound": "Музику не знайдено.",
        "musicNotFoundHint": "Додайте папки у вкладці «Налаштування» або помістіть файли в ~/Music.",
        "unknownArtist": "Невідомий виконавець",
        "vkSectionTitle": "VK Музика",
        "inDevelopmentBadge": "У розробці",
        "vkBannerTitle": "Цей розділ у розробці, очікуйте найближчих оновлень",
        "vkBannerDesc": "У майбутньому оновленні з'явиться пошук, відтворення та завантаження з ВКонтакті.",
        "yandexSectionTitle": "Яндекс Музика",
        "authHeader": "Авторизація",
        "authDesc": "Увійдіть за допомогою токена Яндекс Музики для доступу до бібліотеки.",
        "tokenFieldLabel": "Токен акаунта Яндекс",
        "loginBtn": "Увійти",
        "logoutBtn": "Вийти",
        "connectedAs": "Підключено: {0}",
        "notAuthorizedHint": "Не авторизовано (доступний лише публічний чарт)",
        "chartTitle": "Чарт Яндекс Музики",
        "playlistsTitle": "Плейлисти",
        "loadingTracks": "Завантаження треків...",
        "downloadingTrack": "Завантаження: «{0}»...",
        "downloadSuccess": "«{0}» успішно завантажено!",
        "downloadError": "Помилка завантаження: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Пошук треків та відео в YouTube Music",
        "searchBtn": "Шукати",
        "ytSearching": "Пошук у YouTube...",
        "ytEnterQueryHint": "Введіть назву треку або виконавця",
        "nothingFound": "Нічого не знайдено",
        "tryDifferentQuery": "Спробуйте змінити пошуковий запит",
        "settingsSectionDownload": "Папка для завантажень",
        "settingsDownloadDesc": "Папка для збереження музики з Яндекс Музики та YouTube Music:",
        "settingsNotSelected": "Не вибрано",
        "selectFolderBtn": "Вибрати папку",
        "downloadFolderUpdated": "Папку завантажень оновлено!",
        "settingsSectionLibrary": "Папки з музикою (Медіатека)",
        "selectAndAddFolderBtn": "Вибрати і додати папку",
        "folderAddedSuccess": "Папку успішно додано!",
        "noAddedFolders": "Немає доданих папок",
        "autoScanNotice": "Папка ~/Music та підключені карти microSD скануються автоматично.",
        "modalTitleDownload": "Вибір папки для завантажень",
        "modalTitleLibrary": "Вибір папки з музикою",
        "modalHeaderDownload": "Виберіть папку для збереження треків",
        "modalHeaderLibrary": "Виберіть папку для додавання до медіатеки",
        "quickSelect": "Швидкий вибір:",
        "currentFolder": "Поточна папка:",
        "upBtn": "Вгору",
        "selectThisFolderBtn": "Вибрати цю папку",
        "foldersList": "Папки:",
        "noSubfolders": "Немає вкладених папок",
        "loading": "Завантаження...",
        "languageSettingTitle": "Мова інтерфейсу",
        "languageSettingDesc": "Мова додатка (за замовчуванням визначається мовою Steam):",
        "languageAuto": "Авто (Мова Steam)",
        "aboutTagline": "Музичний плеєр з можливістю відтворення та завантаження треків зі стрімінгових сервісів для Decky Loader Russia",
        "featuresTitle": "Можливості плагіна",
        "featBackgroundTitle": "Фонове відтворення",
        "featBackgroundDesc": "Музика грає паралельно з іграми в Game Mode без втрати продуктивності.",
        "featLocalTitle": "Локальна медіатека",
        "featLocalDesc": "Сканування вбудованої пам'яті та microSD (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Музика",
        "featVkDesc": "Інтеграція ВКонтакті: пошук, прослуховування та завантаження (у розробці).",
        "featYandexTitle": "Яндекс Музика",
        "featYandexDesc": "Стрімінг, синхронізація плейлистів та чарт Top-50.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Швидкий глобальний пошук треків, виконавців та альбомів.",
        "featDownloadTitle": "Завантаження на пристрій",
        "featDownloadDesc": "Збереження у форматі MP3 з тегами та обкладинками для прослуховування офлайн.",
        "techInfoTitle": "Технічні відомості",
        "techAudioEngine": "Аудіорушій:",
        "techInterface": "Інтерфейс:",
        "techConversion": "Конвертація аудіо:",
        "techCreatedFor": "Створено для Decky Loader Russia (deckyloader.ru)"
    },
    "tr": {
        "tabPlayer": "Oynatıcı",
        "tabLocal": "Müziğim",
        "tabVk": "VK Müzik",
        "tabYandex": "Yandex Müzik",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Ayarlar",
        "tabAbout": "Hakkında",
        "openLibrary": "Kütüphaneyi Aç",
        "shuffle": "Karışık",
        "repeatOff": "Tekrar kapalı",
        "repeatAll": "Tümünü tekrarla",
        "repeatOne": "Tekrar 1",
        "statusPlaying": "Çalıyor",
        "statusPaused": "Duraklatıldı",
        "statusStopped": "Durduruldu",
        "noTrackSelected": "Parça seçilmedi",
        "selectSongHint": "Soldaki menüden bir şarkı seçin",
        "clickOpenLibraryHint": "«Kütüphaneyi Aç» düğmesine tıklayın",
        "albumPrefix": "Albüm: ",
        "volLabel": "Ses",
        "unmute": "Sesi Aç",
        "mute": "Sessize Al",
        "sourceVk": "VK Müzik",
        "sourceYandex": "Yandex Müzik",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Yerel dosya",
        "nowPlayingHeader": "Şimdi Çalıyor",
        "repeatMode1": "1",
        "repeatModeAll": "Tümü",
        "repeatModeOff": "Kapalı",
        "localSectionTitle": "Yerel Müzik",
        "searchTracksPlaceholder": "Parçalarda ara",
        "refreshBtn": "Yenile",
        "searchingBtn": "Aranıyor...",
        "tracksFound": "Bulunan parça: {0}",
        "musicNotFound": "Müzik bulunamadı.",
        "musicNotFoundHint": "«Ayarlar»dan klasör ekleyin veya ~/Music içine dosya koyun.",
        "unknownArtist": "Bilinmeyen Sanatçı",
        "vkSectionTitle": "VK Müzik",
        "inDevelopmentBadge": "Geliştiriliyor",
        "vkBannerTitle": "Bu bölüm geliştirme aşamasındadır",
        "vkBannerDesc": "Gelecek bir güncelleme VKontakte üzerinden arama, oynatma ve indirme getirecektir.",
        "yandexSectionTitle": "Yandex Müzik",
        "authHeader": "Yetkilendirme",
        "authDesc": "Kütüphanenize erişmek için Yandex Music belirteciyle giriş yapın.",
        "tokenFieldLabel": "Yandex Hesap Belirteci",
        "loginBtn": "Giriş Yap",
        "logoutBtn": "Çıkış Yap",
        "connectedAs": "Bağlandı: {0}",
        "notAuthorizedHint": "Giriş yapılmadı (sadece genel listeler kullanılabilir)",
        "chartTitle": "Yandex Müzik Listesi",
        "playlistsTitle": "Çalma Listeleri",
        "loadingTracks": "Parçalar yükleniyor...",
        "downloadingTrack": "İndiriliyor: «{0}»...",
        "downloadSuccess": "«{0}» başarıyla indirildi!",
        "downloadError": "İndirme hatası: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "YouTube Music içinde parça ve video ara",
        "searchBtn": "Ara",
        "ytSearching": "YouTube'da aranıyor...",
        "ytEnterQueryHint": "Aramak için parça veya sanatçı adı girin",
        "nothingFound": "Hiçbir şey bulunamadı",
        "tryDifferentQuery": "Farklı bir arama sorgusu deneyin",
        "settingsSectionDownload": "İndirme Klasörü",
        "settingsDownloadDesc": "Yandex ve YouTube Music'ten kaydedilecek klasör:",
        "settingsNotSelected": "Seçilmedi",
        "selectFolderBtn": "Klasör Seç",
        "downloadFolderUpdated": "İndirme klasörü güncellendi!",
        "settingsSectionLibrary": "Müzik Klasörleri (Kütüphane)",
        "selectAndAddFolderBtn": "Klasör Seç ve Ekle",
        "folderAddedSuccess": "Klasör başarıyla eklendi!",
        "noAddedFolders": "Eklenen klasör yok",
        "autoScanNotice": "~/Music klasörü ve takılı microSD kartlar otomatik taranır.",
        "modalTitleDownload": "İndirme Klasörünü Seç",
        "modalTitleLibrary": "Müzik Klasörünü Seç",
        "modalHeaderDownload": "Parçaların kaydedileceği klasörü seçin",
        "modalHeaderLibrary": "Kütüphaneye eklenecek klasörü seçin",
        "quickSelect": "Hızlı Seçim:",
        "currentFolder": "Geçerli Klasör:",
        "upBtn": "Yukarı",
        "selectThisFolderBtn": "Bu Klasörü Seç",
        "foldersList": "Klasörler:",
        "noSubfolders": "Alt klasör yok",
        "loading": "Yükleniyor...",
        "languageSettingTitle": "Arayüz Dili",
        "languageSettingDesc": "Uygulama dili (varsayılan Steam sistem dili):",
        "languageAuto": "Otomatik (Steam Dili)",
        "aboutTagline": "Decky Loader Russia için özel olarak tasarlanmış müzik oynatıcı ve indirici",
        "featuresTitle": "Eklenti Özellikleri",
        "featBackgroundTitle": "Arka Planda Çalma",
        "featBackgroundDesc": "Müzik, Game Mode'daki oyunlarla birlikte performans kaybı olmadan çalar.",
        "featLocalTitle": "Yerel Kütüphane",
        "featLocalDesc": "Dahili bellek ve microSD taraması (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Müzik",
        "featVkDesc": "VKontakte entegrasyonu: arama, dinleme ve indirme (geliştirilmekte).",
        "featYandexTitle": "Yandex Müzik",
        "featYandexDesc": "Akış, çalma listesi senkronizasyonu ve Top-50.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Şarkılar, sanatçılar ve albümler için hızlı küresel arama.",
        "featDownloadTitle": "Cihaza İndir",
        "featDownloadDesc": "Çevrimdışı dinleme için etiketli ve kapaklı MP3 olarak kaydedin.",
        "techInfoTitle": "Teknik Bilgiler",
        "techAudioEngine": "Ses Motoru:",
        "techInterface": "Arayüz:",
        "techConversion": "Ses Dönüştürme:",
        "techCreatedFor": "Decky Loader Russia (deckyloader.ru) için oluşturuldu"
    },
    "cs": {
        "tabPlayer": "Přehrávač",
        "tabLocal": "Moje hudba",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Nastavení",
        "tabAbout": "O doplňku",
        "openLibrary": "Otevřít knihovnu",
        "shuffle": "Náhodně",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Přehrává se",
        "statusPaused": "Pozastaveno",
        "statusStopped": "Zastaveno",
        "noTrackSelected": "Není vybrána žádná skladba",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Hlas.",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Obnovit",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Hledat",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Složka pro stahování",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Vybrat složku",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Jazyk rozhraní",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Automaticky (Jazyk Steamu)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "da": {
        "tabPlayer": "Afspiller",
        "tabLocal": "Min musik",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Indstillinger",
        "tabAbout": "Om plugin",
        "openLibrary": "Åbn bibliotek",
        "shuffle": "Shuffle",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Afspiller",
        "statusPaused": "Sat på pause",
        "statusStopped": "Stoppet",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Lyd",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Opdater",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Søg",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Vælg mappe",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Automatisk (Steam-sprog)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "nl": {
        "tabPlayer": "Speler",
        "tabLocal": "Mijn muziek",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Instellingen",
        "tabAbout": "Over de plugin",
        "openLibrary": "Bibliotheek openen",
        "shuffle": "Willekeurig",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Speelt af",
        "statusPaused": "Gepauzeerd",
        "statusStopped": "Gestopt",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Vol.",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Vernieuwen",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Zoeken",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Map kiezen",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Automatisch (Steam-taal)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "fi": {
        "tabPlayer": "Soitin",
        "tabLocal": "Oma musiikki",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Asetukset",
        "tabAbout": "Tietoja",
        "openLibrary": "Avaa kirjasto",
        "shuffle": "Sekoita",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Toistetaan",
        "statusPaused": "Tauolla",
        "statusStopped": "Pysäytetty",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Ääni",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Päivitä",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Etsi",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Valitse kansio",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Automaattinen (Steamin kieli)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "el": {
        "tabPlayer": "Αναπαραγωγή",
        "tabLocal": "Η μουσική μου",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Ρυθμίσεις",
        "tabAbout": "Σχετικά",
        "openLibrary": "Άνοιγμα βιβλιοθήκης",
        "shuffle": "Shuffle",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Αναπαραγωγή",
        "statusPaused": "Σε παύση",
        "statusStopped": "Σταματημένο",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Ένταση",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Ανανέωση",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Αναζήτηση",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Επιλογή φακέλου",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Αυτόματο (Γλώσσα Steam)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "hu": {
        "tabPlayer": "Lejátszó",
        "tabLocal": "Saját zenék",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Beállítások",
        "tabAbout": "Névjegy",
        "openLibrary": "Könyvtár megnyitása",
        "shuffle": "Véletlenszerű",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Lejátszás",
        "statusPaused": "Szüneteltetve",
        "statusStopped": "Leállítva",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Hangerő",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Frissítés",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Keresés",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Mappa kiválasztása",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Automatikus (Steam nyelv)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "no": {
        "tabPlayer": "Spiller",
        "tabLocal": "Min musikk",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Innstillinger",
        "tabAbout": "Om programtillegget",
        "openLibrary": "Åpne bibliotek",
        "shuffle": "Tilfeldig",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Spiller av",
        "statusPaused": "Pauset",
        "statusStopped": "Stoppet",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Vol.",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Oppdater",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Søk",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Velg mappe",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Automatisk (Steam-språk)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "ro": {
        "tabPlayer": "Redare",
        "tabLocal": "Muzica mea",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Setări",
        "tabAbout": "Despre",
        "openLibrary": "Deschide biblioteca",
        "shuffle": "Shuffle",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "În redare",
        "statusPaused": "Pauză",
        "statusStopped": "Oprit",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Vol.",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Reîmprospătare",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Căutare",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Alege dosar",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Automat (Limba Steam)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "sv": {
        "tabPlayer": "Spelare",
        "tabLocal": "Min musik",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Inställningar",
        "tabAbout": "Om tillägget",
        "openLibrary": "Öppna bibliotek",
        "shuffle": "Blanda",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Spelar",
        "statusPaused": "Pausad",
        "statusStopped": "Stoppad",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Vol.",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Uppdatera",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Sök",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Välj mapp",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Automatiskt (Steam-språk)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "vi": {
        "tabPlayer": "Trình phát",
        "tabLocal": "Nhạc của tôi",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Cài đặt",
        "tabAbout": "Giới thiệu",
        "openLibrary": "Mở thư viện",
        "shuffle": "Shuffle",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Đang phát",
        "statusPaused": "Tạm dừng",
        "statusStopped": "Đã dừng",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Âm lượng",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Làm mới",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Tìm kiếm",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Chọn thư mục",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Tự động (Ngôn ngữ Steam)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "bg": {
        "tabPlayer": "Плейър",
        "tabLocal": "Моята музика",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Настройки",
        "tabAbout": "Относно",
        "openLibrary": "Отвори библиотека",
        "shuffle": "Shuffle",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Възпроизвежда се",
        "statusPaused": "На пауза",
        "statusStopped": "Спряно",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Сила",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Обнови",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Търсене",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Избери папка",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Автоматично (Език на Steam)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "id": {
        "tabPlayer": "Pemutar",
        "tabLocal": "Musik Saya",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "Pengaturan",
        "tabAbout": "Tentang",
        "openLibrary": "Buka Pustaka",
        "shuffle": "Shuffle",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "Memutar",
        "statusPaused": "Jeda",
        "statusStopped": "Berhenti",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "Vol.",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "Segarkan",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "Cari",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "Pilih Folder",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "Otomatis (Bahasa Steam)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    },
    "th": {
        "tabPlayer": "เครื่องเล่น",
        "tabLocal": "เพลงของฉัน",
        "tabVk": "VK Music",
        "tabYandex": "Yandex Music",
        "tabYtmusic": "YouTube Music",
        "tabSettings": "การตั้งค่า",
        "tabAbout": "เกี่ยวกับ",
        "openLibrary": "เปิดคลังเพลง",
        "shuffle": "Shuffle",
        "repeatOff": "Repeat Off",
        "repeatAll": "Repeat All",
        "repeatOne": "Repeat One",
        "statusPlaying": "กำลังเล่น",
        "statusPaused": "หยุดชั่วคราว",
        "statusStopped": "หยุด",
        "noTrackSelected": "No track selected",
        "selectSongHint": "Select a song from the left menu",
        "clickOpenLibraryHint": "Click «Open Library»",
        "albumPrefix": "Album: ",
        "volLabel": "ระดับเสียง",
        "unmute": "Unmute",
        "mute": "Mute",
        "sourceVk": "VK Music",
        "sourceYandex": "Yandex Music",
        "sourceYtmusic": "YouTube Music",
        "sourceLocal": "Local File",
        "nowPlayingHeader": "Now Playing",
        "repeatMode1": "1",
        "repeatModeAll": "All",
        "repeatModeOff": "Off",
        "localSectionTitle": "Local Music",
        "searchTracksPlaceholder": "Search tracks",
        "refreshBtn": "รีเฟรช",
        "searchingBtn": "Searching...",
        "tracksFound": "Tracks found: {0}",
        "musicNotFound": "No music found.",
        "musicNotFoundHint": "Add folders in «Settings» or put audio files in ~/Music.",
        "unknownArtist": "Unknown Artist",
        "vkSectionTitle": "VK Music",
        "inDevelopmentBadge": "In Development",
        "vkBannerTitle": "This section is in development, stay tuned for upcoming updates",
        "vkBannerDesc": "A future update will introduce search, playback, and downloading of tracks and playlists from VKontakte.",
        "yandexSectionTitle": "Yandex Music",
        "authHeader": "Authorization",
        "authDesc": "Log in via Yandex Music token to access your personal library.",
        "tokenFieldLabel": "Yandex Account Token",
        "loginBtn": "Log In",
        "logoutBtn": "Log Out",
        "connectedAs": "Connected: {0}",
        "notAuthorizedHint": "Not authorized (only public chart is available)",
        "chartTitle": "Yandex Music Chart",
        "playlistsTitle": "Playlists",
        "loadingTracks": "Loading tracks...",
        "downloadingTrack": "Downloading: «{0}»...",
        "downloadSuccess": "«{0}» successfully downloaded to download folder!",
        "downloadError": "Download error: {0}",
        "ytSectionTitle": "YouTube Music",
        "ytSearchPlaceholder": "Search tracks and videos in YouTube Music",
        "searchBtn": "ค้นหา",
        "ytSearching": "Searching YouTube...",
        "ytEnterQueryHint": "Enter track or artist name to search",
        "nothingFound": "Nothing found",
        "tryDifferentQuery": "Try a different search query",
        "settingsSectionDownload": "Download Folder",
        "settingsDownloadDesc": "Directory for saving music from Yandex Music and YouTube Music:",
        "settingsNotSelected": "Not selected",
        "selectFolderBtn": "เลือกโฟลเดอร์",
        "downloadFolderUpdated": "Download folder updated successfully!",
        "settingsSectionLibrary": "Music Folders (Library)",
        "selectAndAddFolderBtn": "Select and Add Folder",
        "folderAddedSuccess": "Folder added successfully!",
        "noAddedFolders": "No folders added",
        "autoScanNotice": "The ~/Music folder and mounted microSD cards are scanned automatically.",
        "modalTitleDownload": "Select Download Folder",
        "modalTitleLibrary": "Select Music Folder",
        "modalHeaderDownload": "Choose folder for saving downloaded tracks",
        "modalHeaderLibrary": "Choose folder to add to your library",
        "quickSelect": "Quick Select:",
        "currentFolder": "Current Folder:",
        "upBtn": "Up",
        "selectThisFolderBtn": "Select This Folder",
        "foldersList": "Folders:",
        "noSubfolders": "No subfolders",
        "loading": "Loading...",
        "languageSettingTitle": "Interface Language",
        "languageSettingDesc": "Application language (defaults to Steam system language):",
        "languageAuto": "อัตโนมัติ (ภาษา Steam)",
        "aboutTagline": "Music player with streaming playback and download capabilities designed specifically for Decky Loader Russia",
        "featuresTitle": "Plugin Features",
        "featBackgroundTitle": "Background Playback",
        "featBackgroundDesc": "Music plays smoothly alongside any running games in Game Mode with zero performance impact.",
        "featLocalTitle": "Local Media Library",
        "featLocalDesc": "Scans internal storage and microSD card folders (MP3, FLAC, M4A, OGG, WAV).",
        "featVkTitle": "VK Music",
        "featVkDesc": "VKontakte music integration: search, stream, and download audio tracks (in development).",
        "featYandexTitle": "Yandex Music",
        "featYandexDesc": "Stream tracks, synchronize playlists, favorites, and the Top-50 chart.",
        "featYtTitle": "YouTube Music",
        "featYtDesc": "Fast global search for tracks, artists, and albums with saved query history.",
        "featDownloadTitle": "Download to Device",
        "featDownloadDesc": "Save tracks from Yandex Music and YouTube Music into your chosen folder as MP3 with tags and covers.",
        "techInfoTitle": "Technical Specifications",
        "techAudioEngine": "Audio Engine:",
        "techInterface": "User Interface:",
        "techConversion": "Audio Conversion:",
        "techCreatedFor": "Created for Decky Loader Russia (deckyloader.ru)",
        "tabSpotify": "Spotify",
        "sourceSpotify": "Spotify",
        "spotifySectionTitle": "Spotify",
        "myMusic": "My Music",
        "myPlaylists": "My Playlists",
        "likedTracks": "Liked Songs",
        "openInBrowser": "Open in Browser",
        "scanQrWithPhone": "Scan with your phone camera:",
        "pasteTokenOrUrl": "Or paste token / redirect URL:",
        "tokenFieldPlaceholder": "Token or address bar URL",
        "vkInstructions": "1. Click 'Open in Browser'.\n2. Click 'Allow' on the VK page.\n3. Login will complete automatically.",
        "betaNotice": "Beta version: this section may work incorrectly.",
        "spotifyInstructions": "1. Click 'Open in Browser' or scan the QR code to authenticate with Spotify.\n2. Or enter your Client ID and Client Secret from Spotify Developer Dashboard.",
        "spotifyClientId": "Spotify Client ID",
        "spotifyClientSecret": "Spotify Client Secret",
        "spotifySaveCredentials": "Save Credentials",
        "spotifyAuthWithCredentials": "Log In with Credentials",
        "noPlaylistsFound": "No playlists found",
        "noTracksFound": "No tracks found",
        "backToPlaylists": "← Back to playlists",
        "trackCount": "{0} tracks",
        "searchResults": "Search Results",
        "searchVkPlaceholder": "Search tracks in VK Music",
        "searchSpotifyPlaceholder": "Search tracks in Spotify",
        "vkAuthHeader": "VK Music Authorization",
        "spotifyAuthHeader": "Spotify Authorization",
        "featSpotifyTitle": "Spotify",
        "featSpotifyDesc": "Search, playback and download tracks and playlists from Spotify."
    }
};

const SUPPORTED_LANGUAGES = [
    { code: "auto", name: "Авто (Язык Steam)" },
    { code: "ru", name: "Русский (Russian)" },
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch (German)" },
    { code: "fr", name: "Français (French)" },
    { code: "es", name: "Español (Spanish)" },
    { code: "es-419", name: "Español - Latinoamérica" },
    { code: "it", name: "Italiano (Italian)" },
    { code: "pt-BR", name: "Português do Brasil" },
    { code: "pt", name: "Português (Portugal)" },
    { code: "pl", name: "Polski (Polish)" },
    { code: "zh-CN", name: "简体中文 (Simplified Chinese)" },
    { code: "zh-TW", name: "繁體中文 (Traditional Chinese)" },
    { code: "ja", name: "日本語 (Japanese)" },
    { code: "ko", name: "한국어 (Korean)" },
    { code: "uk", name: "Українська (Ukrainian)" },
    { code: "tr", name: "Türkçe (Turkish)" },
    { code: "cs", name: "Čeština (Czech)" },
    { code: "da", name: "Dansk (Danish)" },
    { code: "nl", name: "Nederlands (Dutch)" },
    { code: "fi", name: "Suomi (Finnish)" },
    { code: "el", name: "Ελληνικά (Greek)" },
    { code: "hu", name: "Magyar (Hungarian)" },
    { code: "no", name: "Norsk (Norwegian)" },
    { code: "ro", name: "Română (Romanian)" },
    { code: "sv", name: "Svenska (Swedish)" },
    { code: "vi", name: "Tiếng Việt (Vietnamese)" },
    { code: "bg", name: "Български (Bulgarian)" },
    { code: "id", name: "Bahasa Indonesia" },
    { code: "th", name: "ไทย (Thai)" },
];
function normalizeLangCode(str) {
    const s = (str || "").toLowerCase().trim();
    if (s.startsWith("ru"))
        return "ru";
    if (s.startsWith("en"))
        return "en";
    if (s.startsWith("de") || s === "german")
        return "de";
    if (s.startsWith("fr") || s === "french")
        return "fr";
    if (s === "latam" || s === "es-419")
        return "es-419";
    if (s.startsWith("es") || s === "spanish")
        return "es";
    if (s.startsWith("it") || s === "italian")
        return "it";
    if (s === "brazilian" || s === "pt-br")
        return "pt-BR";
    if (s.startsWith("pt") || s === "portuguese")
        return "pt";
    if (s.startsWith("pl") || s === "polish")
        return "pl";
    if (s === "schinese" || s === "zh-cn" || s === "zh-hans" || s === "zh")
        return "zh-CN";
    if (s === "tchinese" || s === "zh-tw" || s === "zh-hant")
        return "zh-TW";
    if (s.startsWith("ja") || s === "japanese")
        return "ja";
    if (s.startsWith("ko") || s === "korean" || s === "koreana")
        return "ko";
    if (s.startsWith("uk") || s === "ukrainian")
        return "uk";
    if (s.startsWith("tr") || s === "turkish")
        return "tr";
    if (s.startsWith("cs") || s === "czech")
        return "cs";
    if (s.startsWith("da") || s === "danish")
        return "da";
    if (s.startsWith("nl") || s === "dutch")
        return "nl";
    if (s.startsWith("fi") || s === "finnish")
        return "fi";
    if (s.startsWith("el") || s === "greek")
        return "el";
    if (s.startsWith("hu") || s === "hungarian")
        return "hu";
    if (s.startsWith("no") || s.startsWith("nb") || s === "norwegian")
        return "no";
    if (s.startsWith("ro") || s === "romanian")
        return "ro";
    if (s.startsWith("sv") || s === "swedish")
        return "sv";
    if (s.startsWith("vi") || s === "vietnamese")
        return "vi";
    if (s.startsWith("bg") || s === "bulgarian")
        return "bg";
    if (s.startsWith("id") || s === "indonesian")
        return "id";
    if (s.startsWith("th") || s === "thai")
        return "th";
    return "en";
}
function detectSteamLanguage() {
    try {
        const sc = window.SteamClient;
        if (sc?.Settings?.GetCurrentLanguage) {
            const l = sc.Settings.GetCurrentLanguage();
            if (l)
                return normalizeLangCode(l);
        }
        if (sc?.System?.GetLauncherLanguage) {
            const l = sc.System.GetLauncherLanguage();
            if (l)
                return normalizeLangCode(l);
        }
    }
    catch (_) { }
    try {
        const lm = window.LocalizationManager;
        if (lm?.m_strLanguage) {
            return normalizeLangCode(lm.m_strLanguage);
        }
    }
    catch (_) { }
    try {
        if (typeof navigator !== "undefined" && navigator.language) {
            return normalizeLangCode(navigator.language);
        }
    }
    catch (_) { }
    return "ru";
}
let activeLanguage = "auto";
try {
    const saved = localStorage.getItem("deckymus_language");
    if (saved)
        activeLanguage = saved;
}
catch (_) { }
const listeners = new Set();
function getSelectedLanguageCode() {
    return activeLanguage;
}
function getEffectiveLanguageCode() {
    if (activeLanguage === "auto" || !activeLanguage) {
        return detectSteamLanguage();
    }
    return normalizeLangCode(activeLanguage);
}
function setAppLanguage(code) {
    activeLanguage = code;
    try {
        localStorage.setItem("deckymus_language", code);
    }
    catch (_) { }
    listeners.forEach((fn) => fn());
}
function t(key, ...args) {
    const lang = getEffectiveLanguageCode();
    const dict = translations[lang] || translations["ru"] || translations["en"] || {};
    let val = dict[key] || (translations["ru"] && translations["ru"][key]) || (translations["en"] && translations["en"][key]) || key;
    if (args.length > 0) {
        args.forEach((arg, i) => {
            val = val.replace(new RegExp(`\\{${i}\\}`, "g"), String(arg));
        });
    }
    return val;
}
function useTranslation() {
    const [, setTick] = SP_REACT.useState(0);
    SP_REACT.useEffect(() => {
        const handler = () => setTick((t) => t + 1);
        listeners.add(handler);
        return () => {
            listeners.delete(handler);
        };
    }, []);
    const translate = SP_REACT.useCallback((key, ...args) => {
        return t(key, ...args);
    }, []);
    return {
        t: translate,
        lang: getEffectiveLanguageCode(),
        selectedCode: getSelectedLanguageCode(),
        setLanguage: setAppLanguage,
    };
}

const formatTime$1 = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0)
        return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
const QAMPlayerView = ({ status, onRefresh }) => {
    const { t } = useTranslation();
    const busyRef = SP_REACT.useRef(false);
    const [pressedKey, setPressedKey] = SP_REACT.useState(null);
    const [volume, setVolume] = SP_REACT.useState(status.volume ?? 85);
    const [prevVolume, setPrevVolume] = SP_REACT.useState(85);
    const isDraggingVolumeRef = SP_REACT.useRef(false);
    SP_REACT.useEffect(() => {
        if (!isDraggingVolumeRef.current && typeof status.volume === "number") {
            setVolume(status.volume);
        }
    }, [status.volume]);
    const handleVolumeChange = (newVal) => {
        setVolume(newVal);
        rpcSetVolume(newVal).catch((e) => console.error("Volume set error:", e));
    };
    const toggleMute = () => {
        if (volume > 0) {
            setPrevVolume(volume);
            handleVolumeChange(0);
        }
        else {
            handleVolumeChange(prevVolume > 0 ? prevVolume : 85);
        }
    };
    const isPlaying = status.playback_status === "Playing";
    const hasTrack = Boolean(status.track && status.track.title);
    const duration = status.duration || status.track?.duration || 0;
    const position = status.position || 0;
    const pct = duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;
    const handleAction = async (key, action, e) => {
        if (busyRef.current)
            return;
        busyRef.current = true;
        setPressedKey(key);
        try {
            await action();
        }
        catch (err) {
            console.error("DeckyMus action error:", err);
        }
        finally {
            setTimeout(() => {
                onRefresh();
                setPressedKey(null);
                busyRef.current = false;
            }, 150);
        }
    };
    const handleRepeatCycle = (e) => {
        const nextMode = status.repeat === "off" ? "all" : status.repeat === "all" ? "one" : "off";
        handleAction("repeat", () => rpcSetRepeat(nextMode));
    };
    const handleOpenFullscreen = (e) => {
        setPressedKey("open");
        try {
            if (typeof DFL.Navigation.CloseSideMenus === "function") {
                DFL.Navigation.CloseSideMenus();
            }
            DFL.Navigation.Navigate("/deckymus");
        }
        catch (err) {
            console.warn("Navigation error:", err);
        }
        setTimeout(() => {
            setPressedKey(null);
        }, 120);
    };
    return (SP_JSX.jsxs("div", { style: { width: "100%", boxSizing: "border-box" }, children: [SP_JSX.jsx("style", { children: `
        .deckymus-qam-btn {
          transition: transform 0.1s ease, filter 0.1s ease, box-shadow 0.1s ease, outline 0.1s ease !important;
          box-sizing: border-box !important;
        }
        .deckymus-qam-btn:focus,
        .deckymus-qam-btn:focus-visible,
        .deckymus-qam-btn.focused,
        .deckymus-qam-btn[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.9), inset 0 0 4px rgba(255, 255, 255, 0.4) !important;
          transform: scale(1.05) !important;
          filter: brightness(1.25) !important;
          z-index: 5 !important;
        }
        .deckymus-open-btn {
          transition: transform 0.1s ease, filter 0.1s ease, box-shadow 0.1s ease, outline 0.1s ease !important;
        }
        .deckymus-open-btn,
        .deckymus-open-btn *,
        .deckymus-open-btn:active {
          color: #ffffff !important;
          opacity: 1 !important;
        }
        .deckymus-open-btn:focus,
        .deckymus-open-btn:focus-visible,
        .deckymus-open-btn.focused,
        .deckymus-open-btn[data-focused="true"] {
          outline: 2px solid #ffffff !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.9) !important;
          transform: scale(1.02) !important;
          filter: brightness(1.25) !important;
          color: #ffffff !important;
          z-index: 5 !important;
        }
      ` }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                        display: "flex",
                        flexDirection: "row",
                        gap: "10px",
                        alignItems: "center",
                        padding: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.35)",
                        borderRadius: "8px",
                        marginBottom: "6px",
                        width: "100%",
                        boxSizing: "border-box",
                    }, children: [SP_JSX.jsx("div", { style: {
                                width: "56px",
                                height: "56px",
                                borderRadius: "6px",
                                overflow: "hidden",
                                backgroundColor: "rgba(255, 255, 255, 0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
                            }, children: status.track?.art_url ? (SP_JSX.jsx("img", { src: status.track.art_url, alt: "Cover", style: {
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                } })) : (SP_JSX.jsx(FaMusic, { size: 22, color: "#94a3b8" })) }), SP_JSX.jsxs("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                                minWidth: 0,
                                flex: 1,
                                overflow: "hidden",
                            }, children: [SP_JSX.jsx("div", { style: {
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#f8fafc",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }, title: status.track?.title || "DeckyMus", children: status.track?.title || t("noTrackSelected") }), SP_JSX.jsx("div", { style: {
                                        fontSize: "11px",
                                        color: "#94a3b8",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }, title: status.track?.artist, children: status.track?.artist || t("clickOpenLibraryHint") }), SP_JSX.jsx("div", { style: { marginTop: "3px" }, children: SP_JSX.jsx("span", { style: {
                                            fontSize: "9px",
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            textTransform: "uppercase",
                                            fontWeight: "bold",
                                            display: "inline-block",
                                            backgroundColor: status.playback_status === "Playing"
                                                ? "rgba(34, 197, 94, 0.2)"
                                                : status.playback_status === "Paused"
                                                    ? "rgba(234, 179, 8, 0.2)"
                                                    : "rgba(148, 163, 184, 0.15)",
                                            color: status.playback_status === "Playing"
                                                ? "#4ade80"
                                                : status.playback_status === "Paused"
                                                    ? "#facc15"
                                                    : "#94a3b8",
                                        }, children: status.playback_status === "Playing"
                                            ? t("statusPlaying")
                                            : status.playback_status === "Paused"
                                                ? t("statusPaused")
                                                : t("statusStopped") }) })] })] }) }), hasTrack && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        width: "100%",
                        marginBottom: "6px",
                        pointerEvents: "none",
                        userSelect: "none",
                    }, children: [SP_JSX.jsxs("div", { style: {
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "11px",
                                color: "#94a3b8",
                                fontVariantNumeric: "tabular-nums",
                            }, children: [SP_JSX.jsx("span", { children: formatTime$1(position) }), SP_JSX.jsx("span", { children: formatTime$1(duration) })] }), SP_JSX.jsx("div", { style: {
                                width: "100%",
                                height: "5px",
                                backgroundColor: "rgba(255, 255, 255, 0.12)",
                                borderRadius: "3px",
                                overflow: "hidden",
                            }, children: SP_JSX.jsx("div", { style: {
                                    width: `${pct}%`,
                                    height: "100%",
                                    backgroundColor: "#3b82f6",
                                    borderRadius: "3px",
                                    transition: "width 0.25s linear",
                                } }) })] }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "6px",
                        width: "100%",
                        boxSizing: "border-box",
                        marginBottom: "6px",
                    }, children: [SP_JSX.jsx("div", { style: { minWidth: 0, width: "100%" }, children: SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-qam-btn", disabled: !hasTrack, onPointerDown: () => setPressedKey("prev"), onPointerUp: () => setPressedKey(null), onClick: (e) => handleAction("prev", rpcPreviousTrack), style: {
                                    minWidth: "0px",
                                    width: "100%",
                                    padding: "8px 0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    transform: pressedKey === "prev" ? "scale(0.92)" : "scale(1)",
                                    filter: pressedKey === "prev" ? "brightness(1.4)" : "brightness(1)",
                                }, children: SP_JSX.jsx(FaBackward, { size: 13 }) }) }), SP_JSX.jsx("div", { style: { minWidth: 0, width: "100%" }, children: SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-qam-btn", disabled: !hasTrack, onPointerDown: () => setPressedKey("play"), onPointerUp: () => setPressedKey(null), onClick: (e) => handleAction("play", rpcPlayPause), style: {
                                    minWidth: "0px",
                                    width: "100%",
                                    padding: "8px 0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isPlaying ? "rgba(239, 68, 68, 0.35)" : "rgba(59, 130, 246, 0.35)",
                                    border: isPlaying ? "1px solid rgba(239, 68, 68, 0.55)" : "1px solid rgba(59, 130, 246, 0.55)",
                                    transform: pressedKey === "play" ? "scale(0.92)" : "scale(1)",
                                    filter: pressedKey === "play" ? "brightness(1.4)" : "brightness(1)",
                                }, children: isPlaying ? SP_JSX.jsx(FaPause, { size: 13 }) : SP_JSX.jsx(FaPlay, { size: 13 }) }) }), SP_JSX.jsx("div", { style: { minWidth: 0, width: "100%" }, children: SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-qam-btn", disabled: !hasTrack, onPointerDown: () => setPressedKey("next"), onPointerUp: () => setPressedKey(null), onClick: (e) => handleAction("next", rpcNextTrack), style: {
                                    minWidth: "0px",
                                    width: "100%",
                                    padding: "8px 0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    transform: pressedKey === "next" ? "scale(0.92)" : "scale(1)",
                                    filter: pressedKey === "next" ? "brightness(1.4)" : "brightness(1)",
                                }, children: SP_JSX.jsx(FaForward, { size: 13 }) }) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "6px",
                        width: "100%",
                        boxSizing: "border-box",
                        marginBottom: "8px",
                    }, children: [SP_JSX.jsx("div", { style: { minWidth: 0, width: "100%" }, children: SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-qam-btn", onPointerDown: () => setPressedKey("shuffle"), onPointerUp: () => setPressedKey(null), onClick: (e) => handleAction("shuffle", rpcToggleShuffle), style: {
                                    minWidth: "0px",
                                    width: "100%",
                                    padding: "7px 0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    backgroundColor: status.shuffle ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.08)",
                                    border: status.shuffle ? "1px solid rgba(59, 130, 246, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
                                    transform: pressedKey === "shuffle" ? "scale(0.92)" : "scale(1)",
                                    filter: pressedKey === "shuffle" ? "brightness(1.4)" : "brightness(1)",
                                }, children: [SP_JSX.jsx(FaRandom, { size: 11, color: status.shuffle ? "#60a5fa" : "#94a3b8" }), SP_JSX.jsx("span", { style: {
                                            fontSize: "11px",
                                            fontWeight: status.shuffle ? 600 : "normal",
                                            color: status.shuffle ? "#60a5fa" : "#94a3b8",
                                        }, children: t("shuffle") })] }) }), SP_JSX.jsx("div", { style: { minWidth: 0, width: "100%" }, children: SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-qam-btn", onPointerDown: () => setPressedKey("repeat"), onPointerUp: () => setPressedKey(null), onClick: (e) => handleRepeatCycle(), style: {
                                    minWidth: "0px",
                                    width: "100%",
                                    padding: "7px 0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    backgroundColor: status.repeat !== "off" ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.08)",
                                    border: status.repeat !== "off" ? "1px solid rgba(59, 130, 246, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
                                    transform: pressedKey === "repeat" ? "scale(0.92)" : "scale(1)",
                                    filter: pressedKey === "repeat" ? "brightness(1.4)" : "brightness(1)",
                                }, children: [SP_JSX.jsx(FaRedo, { size: 11, color: status.repeat !== "off" ? "#60a5fa" : "#94a3b8" }), SP_JSX.jsx("span", { style: {
                                            fontSize: "11px",
                                            fontWeight: status.repeat !== "off" ? 600 : "normal",
                                            color: status.repeat !== "off" ? "#60a5fa" : "#94a3b8",
                                        }, children: status.repeat === "one" ? t("repeatOne") : status.repeat === "all" ? t("repeatAll") : t("repeatOff") })] }) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "8px 12px",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "8px",
                        boxSizing: "border-box",
                        marginBottom: "8px",
                    }, children: [SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn", onClick: toggleMute, style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: volume === 0 ? "#ef4444" : "#60a5fa",
                                flexShrink: 0,
                                width: "28px",
                                minWidth: "28px",
                                height: "28px",
                                padding: 0,
                                backgroundColor: "transparent",
                            }, children: volume === 0 ? (SP_JSX.jsx(FaVolumeMute, { size: 14 })) : volume < 50 ? (SP_JSX.jsx(FaVolumeDown, { size: 14 })) : (SP_JSX.jsx(FaVolumeUp, { size: 14 })) }), SP_JSX.jsx("input", { type: "range", min: 0, max: 100, value: volume, onPointerDown: () => {
                                isDraggingVolumeRef.current = true;
                            }, onPointerUp: () => {
                                isDraggingVolumeRef.current = false;
                                onRefresh();
                            }, onChange: (e) => handleVolumeChange(Number(e.target.value)), style: {
                                flex: "1 1 0%",
                                height: "6px",
                                accentColor: "#3b82f6",
                                cursor: "pointer",
                            } }), SP_JSX.jsxs("span", { style: {
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#94a3b8",
                                width: "34px",
                                textAlign: "right",
                                fontVariantNumeric: "tabular-nums",
                                flexShrink: 0,
                            }, children: [Math.round(volume), "%"] })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-qam-btn deckymus-open-btn", onPointerDown: () => setPressedKey("open"), onPointerUp: () => setPressedKey(null), onClick: (e) => handleOpenFullscreen(), style: {
                        minWidth: "0px",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px 0",
                        backgroundColor: "rgba(59, 130, 246, 0.25)",
                        border: "1px solid rgba(59, 130, 246, 0.4)",
                        transform: pressedKey === "open" ? "scale(0.95)" : "scale(1)",
                        filter: pressedKey === "open" ? "brightness(1.3)" : "brightness(1)",
                        color: "#ffffff",
                    }, children: [SP_JSX.jsx(FaExpandAlt, { size: 12, color: "#60a5fa" }), SP_JSX.jsx("span", { style: { color: "#ffffff", fontWeight: 600, opacity: 1, fontSize: "12px" }, children: t("openLibrary") })] }) })] }));
};

/**
 * Yandex Music Icon: yellow squircle with transparent starburst cutout
 * (designed to match the styling of the YouTube Music red squircle/play icon).
 */
const YandexMusicIcon = ({ size = 16, className, style }) => {
    return (SP_JSX.jsx("svg", { width: size, height: size, viewBox: "0 0 100 100", className: className, style: {
            display: "inline-block",
            verticalAlign: "middle",
            flexShrink: 0,
            ...style,
        }, children: SP_JSX.jsx("path", { fill: "#facc15", fillRule: "evenodd", d: "M 22,0 H 78 A 22,22 0 0 1 100,22 V 78 A 22,22 0 0 1 78,100 H 22 A 22,22 0 0 1 0,78 V 22 A 22,22 0 0 1 22,0 Z M 56.2,8.4 L 57.2,8.4 L 65.2,26.4 L 72.6,14.4 L 73.6,15.1 L 72.2,30.1 L 83.6,24.4 L 84.6,25.1 L 76.9,36.1 L 90.3,38.5 L 90.6,39.8 L 77.9,43.1 L 90.6,52.5 L 91.6,54.5 L 76.3,49.5 L 87.0,68.9 L 86.3,70.6 L 71.9,54.8 L 75.6,81.3 L 74.6,83.6 L 64.9,56.5 L 51.2,89.0 L 49.8,91.6 L 47.8,91.6 L 55.5,54.5 L 16.1,75.3 L 15.4,73.2 L 47.8,46.5 L 8.4,41.5 L 9.0,39.8 L 46.2,36.8 L 19.4,20.7 L 22.7,20.1 L 50.8,29.4 L 36.1,10.0 L 38.1,10.0 L 57.5,25.8 L 56.2,8.4 Z" }) }));
};

/**
 * VK Music Icon:
 * Dual-tone squircle (top #0073f7 blue, bottom #ec5cf7 pink with wave separation)
 * with transparent cutout holes for the sound wave bars.
 */
const VkMusicIcon = ({ size = 16, className, style }) => {
    const maskId = SP_REACT.useMemo(() => `vk-mask-${Math.random().toString(36).substring(2, 9)}`, []);
    const clipId = SP_REACT.useMemo(() => `vk-clip-${Math.random().toString(36).substring(2, 9)}`, []);
    return (SP_JSX.jsxs("svg", { width: size, height: size, viewBox: "0 0 100 100", className: className, style: {
            display: "inline-block",
            verticalAlign: "middle",
            flexShrink: 0,
            ...style,
        }, children: [SP_JSX.jsxs("defs", { children: [SP_JSX.jsx("clipPath", { id: clipId, children: SP_JSX.jsx("rect", { x: "0", y: "0", width: "100", height: "100", rx: "22", ry: "22" }) }), SP_JSX.jsxs("mask", { id: maskId, children: [SP_JSX.jsx("rect", { x: "0", y: "0", width: "100", height: "100", fill: "#ffffff" }), SP_JSX.jsx("rect", { x: "11.8", y: "53.0", width: "8.8", height: "14.0", rx: "4.4", ry: "4.4", fill: "#000000" }), SP_JSX.jsx("rect", { x: "28.2", y: "53.0", width: "8.8", height: "14.0", rx: "4.4", ry: "4.4", fill: "#000000" }), SP_JSX.jsx("rect", { x: "44.8", y: "46.8", width: "8.8", height: "26.4", rx: "4.4", ry: "4.4", fill: "#000000" }), SP_JSX.jsx("rect", { x: "61.2", y: "35.3", width: "8.8", height: "49.4", rx: "4.4", ry: "4.4", fill: "#000000" }), SP_JSX.jsx("rect", { x: "77.6", y: "46.8", width: "8.8", height: "26.4", rx: "4.4", ry: "4.4", fill: "#000000" })] })] }), SP_JSX.jsxs("g", { clipPath: `url(#${clipId})`, mask: `url(#${maskId})`, children: [SP_JSX.jsx("rect", { x: "0", y: "0", width: "100", height: "100", fill: "#0073f7" }), SP_JSX.jsx("path", { fill: "#ec5cf7", d: "M 0,46.5 C 32,46.5 46,20 66,20 C 81,20 92,29 100,35.5 L 100,100 L 0,100 Z" })] })] }));
};

/**
 * Spotify Icon:
 * Authentic Spotify green circle (#1ed760) with true transparent cutout holes (not black bars)
 * so that any background behind the icon shows through the sound waves.
 */
const SpotifyIcon = ({ size = 16, className, style }) => {
    return (SP_JSX.jsx("svg", { width: size, height: size, viewBox: "0 0 496 512", className: className, style: {
            display: "inline-block",
            verticalAlign: "middle",
            flexShrink: 0,
            ...style,
        }, children: SP_JSX.jsx("path", { fill: "#1ed760", fillRule: "evenodd", d: "M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z" }) }));
};

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0)
        return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
const NowPlayingTab = ({ status, onRefresh }) => {
    const { t } = useTranslation();
    const isPlaying = status.playback_status === "Playing";
    const hasTrack = Boolean(status.track && status.track.title);
    const duration = status.duration || status.track?.duration || 0;
    const position = status.position || 0;
    const [volume, setVolume] = SP_REACT.useState(status.volume ?? 85);
    const [prevVolume, setPrevVolume] = SP_REACT.useState(85);
    const isDraggingVolumeRef = SP_REACT.useRef(false);
    SP_REACT.useEffect(() => {
        if (!isDraggingVolumeRef.current && typeof status.volume === "number") {
            setVolume(status.volume);
        }
    }, [status.volume]);
    const handleVolumeChange = (newVal) => {
        setVolume(newVal);
        rpcSetVolume(newVal).catch((e) => console.error("Volume set error:", e));
    };
    const toggleMute = () => {
        if (volume > 0) {
            setPrevVolume(volume);
            handleVolumeChange(0);
        }
        else {
            handleVolumeChange(prevVolume > 0 ? prevVolume : 85);
        }
    };
    const handleAction = async (action) => {
        try {
            await action();
        }
        catch (e) {
            console.error("Action error:", e);
        }
        finally {
            setTimeout(onRefresh, 250);
        }
    };
    const handleRepeatCycle = () => {
        const nextMode = status.repeat === "off" ? "all" : status.repeat === "all" ? "one" : "off";
        handleAction(() => rpcSetRepeat(nextMode));
    };
    return (SP_JSX.jsx("div", { style: {
            padding: "16px 20px",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            boxSizing: "border-box",
            overflowX: "hidden",
        }, children: SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                        display: "flex",
                        gap: "16px",
                        alignItems: "stretch",
                        width: "100%",
                        minWidth: 0,
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        overflow: "hidden",
                    }, children: [SP_JSX.jsxs("div", { style: {
                                flex: "1 1 0%",
                                minWidth: 0,
                                maxWidth: "calc(100% - 92px)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "14px",
                                boxSizing: "border-box",
                                overflow: "hidden",
                            }, children: [SP_JSX.jsxs("div", { style: {
                                        display: "flex",
                                        flexDirection: "row",
                                        gap: "20px",
                                        alignItems: "center",
                                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                                        padding: "16px 20px",
                                        borderRadius: "12px",
                                        width: "100%",
                                        minWidth: 0,
                                        maxWidth: "100%",
                                        boxSizing: "border-box",
                                        overflow: "hidden",
                                    }, children: [SP_JSX.jsx("div", { style: {
                                                width: "150px",
                                                height: "150px",
                                                borderRadius: "10px",
                                                overflow: "hidden",
                                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.5)",
                                            }, children: status.track?.art_url ? (SP_JSX.jsx("img", { src: status.track.art_url, alt: "Cover", style: { width: "100%", height: "100%", objectFit: "cover" } })) : (SP_JSX.jsx(FaMusic, { size: 50, color: "#64748b" })) }), SP_JSX.jsxs("div", { style: {
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "6px",
                                                flex: "1 1 0%",
                                                minWidth: 0,
                                                maxWidth: "100%",
                                                boxSizing: "border-box",
                                                overflow: "hidden",
                                            }, children: [SP_JSX.jsx("div", { style: {
                                                        fontSize: "19px",
                                                        fontWeight: 700,
                                                        color: "#f8fafc",
                                                        lineHeight: "1.25",
                                                        width: "100%",
                                                        minWidth: 0,
                                                        maxWidth: "100%",
                                                        wordBreak: "break-word",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                    }, title: status.track?.title, children: status.track?.title || t("noTrackSelected") }), SP_JSX.jsx("div", { style: {
                                                        fontSize: "14px",
                                                        color: "#94a3b8",
                                                        fontWeight: 500,
                                                        width: "100%",
                                                        minWidth: 0,
                                                        maxWidth: "100%",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }, title: status.track?.artist, children: status.track?.artist || t("selectSongHint") }), status.track?.album && (SP_JSX.jsxs("div", { style: {
                                                        fontSize: "12px",
                                                        color: "#64748b",
                                                        width: "100%",
                                                        minWidth: 0,
                                                        maxWidth: "100%",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }, title: status.track.album, children: [t("albumPrefix"), status.track.album] })), SP_JSX.jsx("div", { style: { marginTop: "4px" }, children: SP_JSX.jsx("span", { style: {
                                                            display: "inline-block",
                                                            padding: "3px 10px",
                                                            borderRadius: "6px",
                                                            fontSize: "11px",
                                                            textTransform: "uppercase",
                                                            fontWeight: "bold",
                                                            backgroundColor: status.track?.source === "vk"
                                                                ? "rgba(236, 92, 247, 0.25)"
                                                                : status.track?.source === "yandex"
                                                                    ? "rgba(234, 179, 8, 0.25)"
                                                                    : status.track?.source === "spotify"
                                                                        ? "rgba(30, 215, 96, 0.25)"
                                                                        : status.track?.source === "ytmusic"
                                                                            ? "rgba(239, 68, 68, 0.25)"
                                                                            : "rgba(59, 130, 246, 0.25)",
                                                            color: status.track?.source === "vk"
                                                                ? "#ec5cf7"
                                                                : status.track?.source === "yandex"
                                                                    ? "#facc15"
                                                                    : status.track?.source === "spotify"
                                                                        ? "#1ed760"
                                                                        : status.track?.source === "ytmusic"
                                                                            ? "#f87171"
                                                                            : "#60a5fa",
                                                        }, children: status.track?.source === "vk"
                                                            ? t("sourceVk")
                                                            : status.track?.source === "yandex"
                                                                ? t("sourceYandex")
                                                                : status.track?.source === "spotify"
                                                                    ? t("sourceSpotify")
                                                                    : status.track?.source === "ytmusic"
                                                                        ? t("sourceYtmusic")
                                                                        : status.track?.source === "local"
                                                                            ? t("sourceLocal")
                                                                            : "DeckyMus" }) })] })] }), duration > 0 && (SP_JSX.jsxs("div", { style: {
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "4px",
                                        width: "100%",
                                        minWidth: 0,
                                        maxWidth: "100%",
                                        boxSizing: "border-box",
                                    }, children: [SP_JSX.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }, children: [SP_JSX.jsx("span", { children: formatTime(position) }), SP_JSX.jsx("span", { children: formatTime(duration) })] }), SP_JSX.jsx("input", { type: "range", min: 0, max: Math.max(1, duration), value: Math.min(position, duration), onChange: (e) => handleAction(() => rpcSeek(Number(e.target.value))), style: {
                                                width: "100%",
                                                accentColor: "#3b82f6",
                                                cursor: "pointer",
                                            } })] })), SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                                        display: "grid",
                                        gridTemplateColumns: "repeat(5, 1fr)",
                                        gap: "8px",
                                        width: "100%",
                                        minWidth: 0,
                                        maxWidth: "100%",
                                        boxSizing: "border-box",
                                    }, children: [SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-ctrl-btn", onClick: () => handleAction(rpcToggleShuffle), style: {
                                                minWidth: 0,
                                                padding: "10px 0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: status.shuffle ? "rgba(59, 130, 246, 0.4)" : undefined,
                                            }, children: SP_JSX.jsx(FaRandom, { size: 14, color: status.shuffle ? "#60a5fa" : undefined }) }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-ctrl-btn", disabled: !hasTrack, onClick: () => handleAction(rpcPreviousTrack), style: {
                                                minWidth: 0,
                                                padding: "10px 0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }, children: SP_JSX.jsx(FaBackward, { size: 14 }) }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-ctrl-btn", disabled: !hasTrack, onClick: () => handleAction(rpcPlayPause), style: {
                                                minWidth: 0,
                                                padding: "10px 0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: isPlaying ? "rgba(239, 68, 68, 0.4)" : "rgba(34, 197, 94, 0.4)",
                                            }, children: isPlaying ? SP_JSX.jsx(FaPause, { size: 14 }) : SP_JSX.jsx(FaPlay, { size: 14 }) }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-ctrl-btn", disabled: !hasTrack, onClick: () => handleAction(rpcNextTrack), style: {
                                                minWidth: 0,
                                                padding: "10px 0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }, children: SP_JSX.jsx(FaForward, { size: 14 }) }), SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-ctrl-btn", onClick: handleRepeatCycle, style: {
                                                minWidth: 0,
                                                padding: "10px 0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "4px",
                                                backgroundColor: status.repeat !== "off" ? "rgba(59, 130, 246, 0.4)" : undefined,
                                            }, children: [SP_JSX.jsx(FaRedo, { size: 12, color: status.repeat !== "off" ? "#60a5fa" : undefined }), SP_JSX.jsx("span", { style: { fontSize: "10px", fontWeight: "bold" }, children: status.repeat === "one" ? t("repeatMode1") : status.repeat === "all" ? t("repeatModeAll") : t("repeatModeOff") })] })] })] }), SP_JSX.jsxs("div", { style: {
                                width: "76px",
                                minWidth: "76px",
                                maxWidth: "76px",
                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                borderRadius: "12px",
                                padding: "16px 10px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "space-between",
                                boxSizing: "border-box",
                                flexShrink: 0,
                            }, children: [SP_JSX.jsx("div", { style: {
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        color: "#94a3b8",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        textAlign: "center",
                                    }, children: t("volLabel") }), SP_JSX.jsxs("div", { style: {
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: "#f8fafc",
                                        fontVariantNumeric: "tabular-nums",
                                        textAlign: "center",
                                    }, children: [Math.round(volume), "%"] }), SP_JSX.jsx("div", { style: {
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "12px 0",
                                        width: "100%",
                                    }, children: SP_JSX.jsx("input", { type: "range", min: 0, max: 100, value: volume, onPointerDown: () => {
                                            isDraggingVolumeRef.current = true;
                                        }, onPointerUp: () => {
                                            isDraggingVolumeRef.current = false;
                                            onRefresh();
                                        }, onChange: (e) => handleVolumeChange(Number(e.target.value)), style: {
                                            writingMode: "vertical-lr",
                                            direction: "rtl",
                                            WebkitAppearance: "slider-vertical",
                                            height: "170px",
                                            width: "28px",
                                            accentColor: "#3b82f6",
                                            cursor: "pointer",
                                        } }) }), SP_JSX.jsx("div", { onClick: toggleMute, style: {
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        color: volume === 0 ? "#ef4444" : "#60a5fa",
                                        transition: "background-color 0.1s ease",
                                    }, title: volume === 0 ? t("unmute") : t("mute"), children: volume === 0 ? (SP_JSX.jsx(FaVolumeMute, { size: 16 })) : volume < 50 ? (SP_JSX.jsx(FaVolumeDown, { size: 16 })) : (SP_JSX.jsx(FaVolumeUp, { size: 16 })) })] })] }) }) }) }));
};

const formatDuration$4 = (seconds) => {
    if (!seconds || seconds <= 0)
        return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
};
const LocalLibraryTab = ({ status, onRefresh }) => {
    const { t } = useTranslation();
    const [tracks, setTracks] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(false);
    const [query, setQuery] = SP_REACT.useState("");
    const [loadingTrackIdx, setLoadingTrackIdx] = SP_REACT.useState(null);
    SP_REACT.useRef(null);
    const loadTracks = async () => {
        setLoading(true);
        try {
            const res = await rpcScanLocalMusic();
            if (Array.isArray(res)) {
                setTracks(res);
            }
        }
        catch (e) {
            console.error("Failed to load local tracks:", e);
        }
        finally {
            setLoading(false);
        }
    };
    SP_REACT.useEffect(() => {
        loadTracks();
    }, []);
    const filteredTracks = tracks.filter((t) => {
        if (!query)
            return true;
        const q = query.toLowerCase();
        return ((t.title && t.title.toLowerCase().includes(q)) ||
            (t.artist && t.artist.toLowerCase().includes(q)) ||
            (t.album && t.album.toLowerCase().includes(q)));
    });
    const handlePlay = async (index) => {
        const t = filteredTracks[index];
        const isCurrent = (t.path && status.track?.path === t.path) || (t.id && status.track?.id === t.id);
        if (isCurrent) {
            try {
                await rpcPlayPause();
                setTimeout(onRefresh, 150);
            }
            catch (e) {
                console.error("PlayPause error:", e);
            }
            return;
        }
        setLoadingTrackIdx(index);
        try {
            await rpcPlayQueue(filteredTracks, index);
            setTimeout(onRefresh, 300);
        }
        catch (e) {
            console.error("Play error:", e);
        }
        finally {
            setTimeout(() => setLoadingTrackIdx(null), 1000);
        }
    };
    return (SP_JSX.jsx("div", { style: {
            padding: "16px 20px",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            boxSizing: "border-box",
            overflowX: "hidden",
        }, children: SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                            display: "flex",
                            gap: "8px",
                            width: "100%",
                            marginBottom: "12px",
                            alignItems: "center",
                        }, children: [SP_JSX.jsx("div", { style: { flex: 1, minWidth: 0 }, children: SP_JSX.jsx(DFL.TextField, { value: query, onChange: (e) => setQuery(e?.target?.value || ""), placeholder: t("searchTracksPlaceholder") }) }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn", disabled: loading, onClick: loadTracks, style: {
                                    width: "40px",
                                    minWidth: "40px",
                                    height: "40px",
                                    padding: "0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "8px",
                                    flexShrink: 0,
                                }, children: SP_JSX.jsx(FaSync, { className: loading ? "spin" : "", size: 14 }) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                            width: "100%",
                            minWidth: 0,
                            maxWidth: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            padding: "4px 6px",
                            boxSizing: "border-box",
                        }, children: [SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }, children: t("tracksFound", filteredTracks.length) }), filteredTracks.length === 0 && !loading && (SP_JSX.jsxs("div", { style: {
                                    padding: "32px",
                                    textAlign: "center",
                                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                                    borderRadius: "8px",
                                    color: "#94a3b8",
                                }, children: [SP_JSX.jsx(FaMusic, { size: 32, style: { marginBottom: "8px", opacity: 0.5 } }), SP_JSX.jsx("div", { children: t("musicNotFound") }), SP_JSX.jsx("div", { style: { fontSize: "12px", marginTop: "4px" }, children: t("musicNotFoundHint") })] })), filteredTracks.map((item, idx) => {
                                const isCurrent = (item.path && status.track?.path === item.path) || (item.id && status.track?.id === item.id);
                                const isPlaying = isCurrent && status.playback_status === "Playing";
                                const isCurrentPaused = isCurrent && status.playback_status === "Paused";
                                const isLoadingThis = loadingTrackIdx === idx;
                                return (SP_JSX.jsxs(DFL.Focusable, { className: "deckymus-focus-btn deckymus-track-row", onActivate: () => {
                                        if (isPlaying) {
                                            rpcPlayPause().then(onRefresh);
                                        }
                                        else if (isCurrentPaused) {
                                            rpcPlayPause().then(onRefresh);
                                        }
                                        else {
                                            handlePlay(idx);
                                        }
                                    }, style: {
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "8px 12px",
                                        backgroundColor: isPlaying
                                            ? "rgba(59, 130, 246, 0.2)"
                                            : "rgba(255, 255, 255, 0.03)",
                                        border: isPlaying ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.06)",
                                        borderRadius: "8px",
                                        gap: "10px",
                                        cursor: "pointer",
                                    }, children: [SP_JSX.jsx("div", { style: {
                                                minWidth: "36px",
                                                width: "36px",
                                                height: "36px",
                                                padding: "0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "50%",
                                                backgroundColor: isPlaying ? "#3b82f6" : "rgba(255, 255, 255, 0.1)",
                                                color: "#fff",
                                                flexShrink: 0,
                                            }, children: isLoadingThis ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 12 })) : isPlaying ? (SP_JSX.jsx(FaPause, { size: 12 })) : (SP_JSX.jsx(FaPlay, { size: 12, style: { marginLeft: "2px" } })) }), item.art_url ? (SP_JSX.jsx("img", { src: item.art_url, alt: "", style: { width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 } })) : (SP_JSX.jsx("div", { style: {
                                                width: "38px",
                                                height: "38px",
                                                borderRadius: "6px",
                                                backgroundColor: "rgba(255, 255, 255, 0.08)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#94a3b8",
                                                flexShrink: 0,
                                            }, children: SP_JSX.jsx(FaMusic, { size: 14 }) })), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0, overflow: "hidden" }, children: [SP_JSX.jsx("div", { style: {
                                                        fontSize: "14px",
                                                        fontWeight: 600,
                                                        color: isPlaying ? "#60a5fa" : "#f8fafc",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }, children: item.title }), SP_JSX.jsx("div", { style: {
                                                        fontSize: "12px",
                                                        color: "#94a3b8",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }, children: item.artist || t("unknownArtist") })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#64748b", minWidth: "40px", textAlign: "right", flexShrink: 0 }, children: formatDuration$4(item.duration) })] }, item.id || item.path || idx));
                            })] }) })] }) }));
};

/**
 * Robust external auth URL opener for SteamOS / Decky Loader.
 * Supports modern SteamOS (WindowStore.m_mapDesiredWindowInstances) as well as legacy navigators and backend CEF bridge.
 */
const openExternalAuthUrl = async (url) => {
    if (!url)
        return;
    // 1. Direct navigation through modern SteamOS WindowStore Navigator
    try {
        const s = window.SteamUIStore;
        const w = s?.WindowStore?.m_mapDesiredWindowInstances?.get?.(1) || s?.GetFocusedWindowInstance?.();
        if (typeof w?.m_Navigator?.ExternalWeb === "function") {
            w.m_Navigator.ExternalWeb(url);
        }
    }
    catch (e) {
        console.warn("Direct m_Navigator.ExternalWeb failed:", e);
    }
    // 2. Navigation through @decky/ui router
    try {
        if (typeof DFL.Navigation?.NavigateToExternalWeb === "function") {
            DFL.Navigation.NavigateToExternalWeb(url);
        }
    }
    catch (e) {
        console.warn("Navigation.NavigateToExternalWeb failed:", e);
    }
    // 3. Fallback / complementary backend CEF trigger
    try {
        await rpcOpenBrowser(url);
    }
    catch (e) {
        console.warn("rpcOpenBrowser failed:", e);
    }
};

// Persistent caches
let cachedVkTracks = [];
let cachedVkPlaylists = [];
let cachedVkView = "my_music";
let cachedVkSearchQuery = "";
let cachedVkSearchResults = [];
const formatDuration$3 = (seconds) => {
    if (!seconds || seconds <= 0)
        return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
};
const VkMusicTab = ({ status, onRefresh }) => {
    const { t } = useTranslation();
    const [vkStatus, setVkStatus] = SP_REACT.useState({
        has_token: false,
        logged_in: false,
        user_name: "",
    });
    const [activeView, setActiveView] = SP_REACT.useState(cachedVkView);
    const [tracks, setTracks] = SP_REACT.useState(cachedVkTracks);
    const [playlists, setPlaylists] = SP_REACT.useState(cachedVkPlaylists);
    const [selectedPlaylist, setSelectedPlaylist] = SP_REACT.useState(null);
    const [playlistTracks, setPlaylistTracks] = SP_REACT.useState([]);
    const [searchQuery, setSearchQuery] = SP_REACT.useState(cachedVkSearchQuery);
    const [searchResults, setSearchResults] = SP_REACT.useState(cachedVkSearchResults);
    const [loading, setLoading] = SP_REACT.useState(false);
    const [statusMsg, setStatusMsg] = SP_REACT.useState("");
    const [statusIsError, setStatusIsError] = SP_REACT.useState(false);
    const [loadingTrackIdx, setLoadingTrackIdx] = SP_REACT.useState(null);
    // Manual token input state
    SP_REACT.useState(false);
    SP_REACT.useState("");
    SP_REACT.useState(false);
    // Downloads tracking
    const [downloadedIds, setDownloadedIds] = SP_REACT.useState(new Set());
    const [downloadedNames, setDownloadedNames] = SP_REACT.useState(new Set());
    const [downloadingIds, setDownloadingIds] = SP_REACT.useState(new Set());
    const loadDownloaded = async () => {
        try {
            const info = await rpcGetDownloadedInfo();
            if (info) {
                setDownloadedIds(new Set(info.ids || []));
                setDownloadedNames(new Set(info.filenames || []));
            }
        }
        catch (e) {
            console.error("loadDownloaded error:", e);
        }
    };
    const isDownloaded = (item) => {
        if (item.id && downloadedIds.has(String(item.id)))
            return true;
        const cleanT = (item.title || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
        const cleanA = (item.artist || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
        const full = cleanA ? `${cleanA} - ${cleanT}` : cleanT;
        return downloadedNames.has(full) || downloadedNames.has(cleanT);
    };
    const handleDownload = async (item) => {
        const tid = String(item.id);
        setDownloadingIds((prev) => new Set(prev).add(tid));
        setStatusIsError(false);
        setStatusMsg(t("downloadingTrack", item.title));
        try {
            const res = await rpcDownloadTrack(item);
            if (res && res.success) {
                setDownloadedIds((prev) => new Set(prev).add(tid));
                const cleanT = (item.title || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
                const cleanA = (item.artist || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
                const full = cleanA ? `${cleanA} - ${cleanT}` : cleanT;
                setDownloadedNames((prev) => new Set(prev).add(full));
                setStatusIsError(false);
                setStatusMsg(t("downloadSuccess", item.title));
                setTimeout(() => setStatusMsg(""), 4000);
            }
            else {
                setStatusIsError(true);
                setStatusMsg(t("downloadError", res?.error || "Error"));
                setTimeout(() => setStatusMsg(""), 4000);
            }
        }
        catch (e) {
            console.error("Download exception:", e);
            setStatusIsError(true);
            setStatusMsg(t("downloadError", "Exception"));
            setTimeout(() => setStatusMsg(""), 4000);
        }
        finally {
            setDownloadingIds((prev) => {
                const next = new Set(prev);
                next.delete(tid);
                return next;
            });
        }
    };
    const loadStatus = async () => {
        try {
            const s = await rpcVkGetStatus();
            setVkStatus(s);
            if (s.logged_in) {
                if (cachedVkTracks.length === 0) {
                    loadMyMusic();
                }
            }
        }
        catch (e) {
            console.error("VK status error:", e);
        }
    };
    const loadMyMusic = async () => {
        setLoading(true);
        try {
            const res = await rpcVkGetMyMusic(0, 100);
            const list = res || [];
            setTracks(list);
            cachedVkTracks = list;
        }
        catch (e) {
            console.error("loadMyMusic error:", e);
        }
        finally {
            setLoading(false);
        }
    };
    const loadPlaylists = async () => {
        setLoading(true);
        try {
            const res = await rpcVkGetPlaylists(0, 50);
            const list = res || [];
            setPlaylists(list);
            cachedVkPlaylists = list;
        }
        catch (e) {
            console.error("loadPlaylists error:", e);
        }
        finally {
            setLoading(false);
        }
    };
    const openPlaylist = async (pl) => {
        setSelectedPlaylist(pl);
        setActiveView("playlist_tracks");
        setLoading(true);
        try {
            const res = await rpcVkGetPlaylistTracks(pl.id, pl.owner_id, 0, 100);
            setPlaylistTracks(res || []);
        }
        catch (e) {
            console.error("openPlaylist error:", e);
            setPlaylistTracks([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSearch = async () => {
        const q = searchQuery.trim();
        if (!q)
            return;
        setLoading(true);
        setActiveView("search");
        cachedVkView = "search";
        cachedVkSearchQuery = q;
        try {
            const res = await rpcVkSearch(q, 0, 50);
            const list = res || [];
            setSearchResults(list);
            cachedVkSearchResults = list;
        }
        catch (e) {
            console.error("VK search error:", e);
            setSearchResults([]);
        }
        finally {
            setLoading(false);
        }
    };
    const openBrowser = async () => {
        if (vkStatus.auth_url) {
            await openExternalAuthUrl(vkStatus.auth_url);
        }
    };
    const handleOpenBrowser = openBrowser;
    const handlePlayTrack = async (targetList, index) => {
        setLoadingTrackIdx(index);
        try {
            await rpcPlayQueue(targetList, index);
            onRefresh();
        }
        catch (e) {
            console.error("handlePlayTrack error:", e);
        }
        finally {
            setLoadingTrackIdx(null);
        }
    };
    SP_REACT.useRef(null);
    SP_REACT.useEffect(() => {
        loadStatus();
        loadDownloaded();
        const interval = setInterval(async () => {
            // Periodically check if logged in via phone helper or browser session
            if (!vkStatus.logged_in) {
                const s = await rpcVkGetStatus();
                if (s.logged_in) {
                    setVkStatus(s);
                    loadMyMusic();
                    try {
                        if (typeof DFL.Navigation?.NavigateBack === "function") {
                            DFL.Navigation.NavigateBack();
                        }
                        const sc = window.SteamClient;
                        if (typeof sc?.Overlay?.CloseOverlay === "function") {
                            sc.Overlay.CloseOverlay();
                        }
                    }
                    catch (e) { }
                }
            }
        }, 800);
        return () => clearInterval(interval);
    }, [vkStatus.logged_in]);
    const currentList = activeView === "my_music"
        ? tracks
        : activeView === "playlist_tracks"
            ? playlistTracks
            : searchResults;
    return (SP_JSX.jsx("div", { style: {
            padding: "16px 20px",
            width: "100%",
            maxWidth: "850px",
            margin: "0 auto",
            boxSizing: "border-box",
            overflowX: "hidden",
        }, children: SP_JSX.jsxs(DFL.PanelSection, { children: [statusMsg && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            backgroundColor: statusIsError ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                            border: `1px solid ${statusIsError ? "rgba(239, 68, 68, 0.4)" : "rgba(34, 197, 94, 0.4)"}`,
                            color: statusIsError ? "#f87171" : "#4ade80",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "12px",
                        }, children: [SP_JSX.jsx("span", { children: statusMsg }), SP_JSX.jsx(DFL.DialogButton, { style: { minWidth: "40px", padding: "4px 8px", fontSize: "11px" }, onClick: () => setStatusMsg(""), children: "\u2715" })] }) })), !vkStatus.logged_in ? (SP_JSX.jsx(SP_JSX.Fragment, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                padding: "28px 20px",
                                backgroundColor: "rgba(0, 115, 247, 0.08)",
                                borderRadius: "14px",
                                border: "1px solid rgba(0, 115, 247, 0.25)",
                                width: "100%",
                                boxSizing: "border-box",
                                marginBottom: "16px",
                                textAlign: "center",
                            }, children: [SP_JSX.jsx("div", { style: {
                                        width: "64px",
                                        height: "64px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                                        borderRadius: "16px",
                                        marginBottom: "12px",
                                    }, children: SP_JSX.jsx(VkMusicIcon, { size: 48 }) }), SP_JSX.jsx("div", { style: { fontSize: "18px", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }, children: t("vkAuthHeader") }), SP_JSX.jsx("div", { style: {
                                        fontSize: "13px",
                                        color: "#94a3b8",
                                        maxWidth: "500px",
                                        lineHeight: "1.5",
                                        whiteSpace: "pre-line",
                                        marginBottom: "24px",
                                    }, children: t("vkInstructions") }), SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                        padding: "14px 28px",
                                        backgroundColor: "#0073f7",
                                        color: "#ffffff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        fontWeight: 700,
                                        fontSize: "14px",
                                        borderRadius: "10px",
                                        maxWidth: "320px",
                                        width: "100%",
                                    }, onClick: handleOpenBrowser, children: [SP_JSX.jsx(FaExternalLinkAlt, { size: 16 }), SP_JSX.jsx("span", { children: t("openInBrowser") })] })] }) }) })) : (
                /* LOGGED IN: Full VK Music Experience */
                SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    padding: "12px 16px",
                                    backgroundColor: "rgba(0, 115, 247, 0.12)",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(0, 115, 247, 0.25)",
                                    width: "100%",
                                    boxSizing: "border-box",
                                    marginBottom: "14px",
                                }, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }, children: [vkStatus.avatar ? (SP_JSX.jsx("img", { src: vkStatus.avatar, alt: "Avatar", style: { width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 } })) : (SP_JSX.jsx("div", { style: {
                                                width: "38px",
                                                height: "38px",
                                                borderRadius: "50%",
                                                backgroundColor: "#0073f7",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#fff",
                                                fontWeight: 700,
                                                flexShrink: 0,
                                            }, children: "VK" })), SP_JSX.jsxs("div", { style: { minWidth: 0, overflow: "hidden" }, children: [SP_JSX.jsx("div", { style: {
                                                        fontSize: "15px",
                                                        fontWeight: 600,
                                                        color: "#f8fafc",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }, children: vkStatus.user_name }), SP_JSX.jsxs("div", { style: {
                                                        fontSize: "11px",
                                                        color: "#94a3b8",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }, children: ["ID: ", vkStatus.user_id] })] })] }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: { display: "flex", gap: "8px", width: "100%", marginBottom: "12px", alignItems: "center" }, children: [SP_JSX.jsx("div", { style: { flex: 1, minWidth: 0 }, children: SP_JSX.jsx(DFL.TextField, { value: searchQuery, onChange: (e) => setSearchQuery(e?.target?.value || ""), placeholder: t("searchVkPlaceholder"), onKeyDown: (e) => {
                                                if (e.key === "Enter")
                                                    handleSearch();
                                            } }) }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn deckymus-search-btn", style: {
                                            width: "40px",
                                            minWidth: "40px",
                                            height: "40px",
                                            padding: "0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "8px",
                                            flexShrink: 0,
                                        }, onClick: handleSearch, disabled: loading, children: loading && activeView === "search" ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 14 })) : (SP_JSX.jsx(FaSearch, { size: 14 })) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: { display: "flex", gap: "8px", width: "100%", marginBottom: "16px" }, children: [SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                            flex: 1,
                                            padding: "8px 12px",
                                            backgroundColor: activeView === "my_music" ? "rgba(0, 115, 247, 0.4)" : "rgba(255, 255, 255, 0.05)",
                                            border: activeView === "my_music" ? "1px solid #0073f7" : "1px solid transparent",
                                            fontWeight: activeView === "my_music" ? 700 : 500,
                                        }, onClick: () => {
                                            setActiveView("my_music");
                                            cachedVkView = "my_music";
                                            if (tracks.length === 0)
                                                loadMyMusic();
                                        }, children: [SP_JSX.jsx(FaMusic, { size: 12, style: { marginRight: "6px" } }), SP_JSX.jsx("span", { children: t("myMusic") })] }), SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                            flex: 1,
                                            padding: "8px 12px",
                                            backgroundColor: activeView === "playlists" || activeView === "playlist_tracks"
                                                ? "rgba(0, 115, 247, 0.4)"
                                                : "rgba(255, 255, 255, 0.05)",
                                            border: activeView === "playlists" || activeView === "playlist_tracks"
                                                ? "1px solid #0073f7"
                                                : "1px solid transparent",
                                            fontWeight: activeView === "playlists" || activeView === "playlist_tracks" ? 700 : 500,
                                        }, onClick: () => {
                                            setActiveView("playlists");
                                            cachedVkView = "playlists";
                                            if (playlists.length === 0)
                                                loadPlaylists();
                                        }, children: [SP_JSX.jsx(FaListUl, { size: 12, style: { marginRight: "6px" } }), SP_JSX.jsx("span", { children: t("myPlaylists") })] }), searchResults.length > 0 && (SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                            flex: 1,
                                            padding: "8px 12px",
                                            backgroundColor: activeView === "search" ? "rgba(0, 115, 247, 0.4)" : "rgba(255, 255, 255, 0.05)",
                                            border: activeView === "search" ? "1px solid #0073f7" : "1px solid transparent",
                                            fontWeight: activeView === "search" ? 700 : 500,
                                        }, onClick: () => {
                                            setActiveView("search");
                                            cachedVkView = "search";
                                        }, children: [SP_JSX.jsx(FaSearch, { size: 12, style: { marginRight: "6px" } }), SP_JSX.jsx("span", { children: t("searchResults") })] }))] }) }), activeView === "playlist_tracks" && selectedPlaylist && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    marginBottom: "12px",
                                }, children: [SP_JSX.jsxs(DFL.DialogButton, { style: { padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }, onClick: () => setActiveView("playlists"), children: [SP_JSX.jsx(FaArrowLeft, { size: 11 }), SP_JSX.jsx("span", { children: t("backToPlaylists") })] }), SP_JSX.jsx("span", { style: { fontSize: "14px", fontWeight: 700, color: "#f8fafc" }, children: selectedPlaylist.title })] }) })), activeView === "playlists" && (SP_JSX.jsx(DFL.PanelSectionRow, { children: playlists.length === 0 && !loading ? (SP_JSX.jsx("div", { style: { textAlign: "center", padding: "30px", color: "#94a3b8", width: "100%" }, children: t("noPlaylistsFound") })) : (SP_JSX.jsx("div", { style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                                    gap: "12px",
                                    width: "100%",
                                }, children: playlists.map((pl) => (SP_JSX.jsxs("div", { tabIndex: 0, className: "deckymus-playlist-card", onClick: () => openPlaylist(pl), onKeyDown: (e) => {
                                        if (e.key === "Enter")
                                            openPlaylist(pl);
                                    }, style: {
                                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                                        border: "1px solid rgba(255, 255, 255, 0.08)",
                                        borderRadius: "10px",
                                        padding: "10px",
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        textAlign: "center",
                                        transition: "background-color 0.2s",
                                    }, children: [pl.cover ? (SP_JSX.jsx("img", { src: pl.cover, alt: pl.title, style: {
                                                width: "100%",
                                                aspectRatio: "1/1",
                                                borderRadius: "8px",
                                                objectFit: "cover",
                                                marginBottom: "8px",
                                            } })) : (SP_JSX.jsx("div", { style: {
                                                width: "100%",
                                                aspectRatio: "1/1",
                                                borderRadius: "8px",
                                                backgroundColor: "rgba(0, 115, 247, 0.2)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginBottom: "8px",
                                                color: "#0073f7",
                                            }, children: SP_JSX.jsx(FaListUl, { size: 32 }) })), SP_JSX.jsx("div", { style: {
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                color: "#f8fafc",
                                                width: "100%",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }, children: pl.title }), SP_JSX.jsx("div", { style: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" }, children: t("trackCount", pl.track_count) })] }, `${pl.owner_id}_${pl.id}`))) })) })), activeView !== "playlists" && (SP_JSX.jsx(DFL.PanelSectionRow, { children: loading && currentList.length === 0 ? (SP_JSX.jsxs("div", { style: { textAlign: "center", padding: "40px", color: "#94a3b8", width: "100%" }, children: [SP_JSX.jsx(FaSpinner, { className: "spin", size: 24, style: { marginBottom: "10px" } }), SP_JSX.jsx("div", { children: t("loading") })] })) : currentList.length === 0 ? (SP_JSX.jsx("div", { style: { textAlign: "center", padding: "40px", color: "#94a3b8", width: "100%" }, children: t("noTracksFound") })) : (SP_JSX.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "6px", width: "100%", padding: "4px 6px", boxSizing: "border-box" }, children: currentList.map((track, idx) => {
                                    const isPlaying = status.playback_status === "Playing" &&
                                        status.track?.title === track.title &&
                                        status.track?.artist === track.artist;
                                    const isCurrentPaused = status.playback_status === "Paused" &&
                                        status.track?.title === track.title &&
                                        status.track?.artist === track.artist;
                                    const downloaded = isDownloaded(track);
                                    const downloading = downloadingIds.has(String(track.id));
                                    return (SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            width: "100%",
                                            boxSizing: "border-box",
                                        }, children: [SP_JSX.jsxs(DFL.Focusable, { className: "deckymus-focus-btn", onActivate: () => {
                                                    if (isPlaying) {
                                                        rpcPlayPause().then(onRefresh);
                                                    }
                                                    else if (isCurrentPaused) {
                                                        rpcPlayPause().then(onRefresh);
                                                    }
                                                    else {
                                                        handlePlayTrack(currentList, idx);
                                                    }
                                                }, style: {
                                                    flex: 1,
                                                    minWidth: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    padding: "8px 12px",
                                                    backgroundColor: isPlaying
                                                        ? "rgba(0, 115, 247, 0.2)"
                                                        : "rgba(255, 255, 255, 0.03)",
                                                    border: isPlaying ? "1px solid #0073f7" : "1px solid rgba(255, 255, 255, 0.06)",
                                                    borderRadius: "8px",
                                                    gap: "10px",
                                                    cursor: "pointer",
                                                }, children: [SP_JSX.jsx("div", { style: {
                                                            minWidth: "36px",
                                                            width: "36px",
                                                            height: "36px",
                                                            borderRadius: "50%",
                                                            backgroundColor: isPlaying ? "#0073f7" : "rgba(255, 255, 255, 0.1)",
                                                            color: "#fff",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }, children: loadingTrackIdx === idx ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 12 })) : isPlaying ? (SP_JSX.jsx(FaPause, { size: 12 })) : (SP_JSX.jsx(FaPlay, { size: 12, style: { marginLeft: "2px" } })) }), track.art_url ? (SP_JSX.jsx("img", { src: track.art_url, alt: track.title, style: { width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 } })) : (SP_JSX.jsx("div", { style: {
                                                            width: "38px",
                                                            height: "38px",
                                                            borderRadius: "6px",
                                                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#94a3b8",
                                                            flexShrink: 0,
                                                        }, children: SP_JSX.jsx(FaMusic, { size: 14 }) })), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [SP_JSX.jsx("div", { style: {
                                                                    fontSize: "14px",
                                                                    fontWeight: 600,
                                                                    color: isPlaying ? "#60a5fa" : "#f8fafc",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }, children: track.title }), SP_JSX.jsx("div", { style: {
                                                                    fontSize: "12px",
                                                                    color: "#94a3b8",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }, children: track.artist || t("unknownArtist") })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#64748b", minWidth: "40px", textAlign: "right", flexShrink: 0 }, children: formatDuration$3(track.duration) })] }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                                    minWidth: "36px",
                                                    width: "36px",
                                                    height: "44px",
                                                    padding: "0",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "8px",
                                                    backgroundColor: downloaded
                                                        ? "rgba(34, 197, 94, 0.2)"
                                                        : "rgba(255, 255, 255, 0.06)",
                                                    border: downloaded ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                                                    color: downloaded ? "#4ade80" : "#cbd5e1",
                                                    flexShrink: 0,
                                                }, disabled: downloading, onClick: () => handleDownload(track), children: downloading ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 12 })) : downloaded ? (SP_JSX.jsx(FaCheck, { size: 12 })) : (SP_JSX.jsx(FaDownload, { size: 12 })) })] }, `${track.id || idx}_${track.title}`));
                                }) })) }))] }))] }) }));
};

// Module-level persistent cache across tab navigation
let cachedYandexPlaylists = [];
let cachedYandexTracks = [];
let cachedSelectedPlaylistName = "";
let cachedSelectedPlaylistId = "chart";
const formatDuration$2 = (seconds) => {
    if (!seconds || seconds <= 0)
        return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
};
const YandexMusicTab = ({ status, onRefresh }) => {
    const { t } = useTranslation();
    const [yandexStatus, setYandexStatus] = SP_REACT.useState({ has_token: false, logged_in: false, user_name: "" });
    const [playlists, setPlaylists] = SP_REACT.useState(cachedYandexPlaylists);
    const [tracks, setTracks] = SP_REACT.useState(cachedYandexTracks);
    const [selectedPlaylistId, setSelectedPlaylistId] = SP_REACT.useState(cachedSelectedPlaylistId);
    const [selectedPlaylistName, setSelectedPlaylistName] = SP_REACT.useState(cachedSelectedPlaylistName || t("chartTitle"));
    const [loading, setLoading] = SP_REACT.useState(false);
    const [statusMsg, setStatusMsg] = SP_REACT.useState("");
    const [statusIsError, setStatusIsError] = SP_REACT.useState(false);
    const [loadingTrackIdx, setLoadingTrackIdx] = SP_REACT.useState(null);
    const [tokenInput, setTokenInput] = SP_REACT.useState("");
    // Download state tracking
    const [downloadedIds, setDownloadedIds] = SP_REACT.useState(new Set());
    const [downloadedNames, setDownloadedNames] = SP_REACT.useState(new Set());
    const [downloadingIds, setDownloadingIds] = SP_REACT.useState(new Set());
    const loadDownloaded = async () => {
        try {
            const info = await rpcGetDownloadedInfo();
            if (info) {
                setDownloadedIds(new Set(info.ids || []));
                setDownloadedNames(new Set(info.filenames || []));
            }
        }
        catch (e) {
            console.error("loadDownloaded error:", e);
        }
    };
    const isDownloaded = (item) => {
        if (item.id && downloadedIds.has(String(item.id)))
            return true;
        const cleanT = (item.title || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
        const cleanA = (item.artist || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
        const full = cleanA ? `${cleanA} - ${cleanT}` : cleanT;
        return downloadedNames.has(full) || downloadedNames.has(cleanT);
    };
    const handleDownload = async (item) => {
        const tid = String(item.id);
        setDownloadingIds((prev) => new Set(prev).add(tid));
        setStatusIsError(false);
        setStatusMsg(t("downloadingTrack", item.title));
        try {
            const res = await rpcDownloadTrack(item);
            if (res && res.success) {
                setDownloadedIds((prev) => new Set(prev).add(tid));
                const cleanT = (item.title || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
                const cleanA = (item.artist || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
                const full = cleanA ? `${cleanA} - ${cleanT}` : cleanT;
                setDownloadedNames((prev) => new Set(prev).add(full));
                setStatusIsError(false);
                setStatusMsg(t("downloadSuccess", item.title));
                setTimeout(() => setStatusMsg(""), 4000);
            }
            else {
                setStatusIsError(true);
                setStatusMsg(t("downloadError", res?.error || "Error"));
                setTimeout(() => setStatusMsg(""), 4000);
            }
        }
        catch (e) {
            console.error("Download exception:", e);
            setStatusIsError(true);
            setStatusMsg(t("downloadError", "Exception"));
            setTimeout(() => setStatusMsg(""), 4000);
        }
        finally {
            setDownloadingIds((prev) => {
                const next = new Set(prev);
                next.delete(tid);
                return next;
            });
        }
    };
    const loadStatus = async () => {
        try {
            const s = await rpcYandexGetStatus();
            setYandexStatus(s);
            if (s.logged_in) {
                loadPlaylists();
            }
            else if (cachedYandexTracks.length === 0) {
                loadChart();
            }
        }
        catch (e) {
            console.error("Yandex status error:", e);
        }
    };
    const loadChart = async () => {
        setLoading(true);
        setSelectedPlaylistId("chart");
        cachedSelectedPlaylistId = "chart";
        const chartName = t("chartTitle");
        setSelectedPlaylistName(chartName);
        cachedSelectedPlaylistName = chartName;
        try {
            const res = await rpcYandexGetChart();
            const list = res || [];
            setTracks(list);
            cachedYandexTracks = list;
            loadDownloaded();
        }
        catch (e) {
            console.error("Chart error:", e);
        }
        finally {
            setLoading(false);
        }
    };
    const loadPlaylists = async () => {
        try {
            const pls = await rpcYandexGetPlaylists();
            const pList = pls || [];
            setPlaylists(pList);
            cachedYandexPlaylists = pList;
            if (cachedYandexTracks.length === 0) {
                if (pList.length > 0) {
                    loadPlaylistTracks(pList[0].id, pList[0].owner_id || "", pList[0].title);
                }
                else {
                    loadChart();
                }
            }
        }
        catch (e) {
            console.error("Playlists error:", e);
        }
    };
    const loadPlaylistTracks = async (plId, ownerId, title) => {
        setLoading(true);
        setSelectedPlaylistId(plId);
        cachedSelectedPlaylistId = plId;
        setSelectedPlaylistName(title);
        cachedSelectedPlaylistName = title;
        try {
            const res = await rpcYandexGetPlaylistTracks(plId, ownerId);
            const list = res || [];
            setTracks(list);
            cachedYandexTracks = list;
            loadDownloaded();
        }
        catch (e) {
            console.error("Playlist tracks error:", e);
        }
        finally {
            setLoading(false);
        }
    };
    const openBrowser = async () => {
        if (yandexStatus.auth_url) {
            await openExternalAuthUrl(yandexStatus.auth_url);
        }
    };
    const handleOpenBrowser = openBrowser;
    const handleSaveToken = async () => {
        let tVal = tokenInput.trim();
        const m = tVal.match(/access_token[=:]+([^&\s#"']+)/);
        if (m)
            tVal = m[1];
        if (!tVal)
            return;
        setLoading(true);
        try {
            const res = await rpcYandexSetToken(tVal);
            if (res && res.success) {
                setTokenInput("");
                await loadStatus();
            }
            else {
                setStatusIsError(true);
                setStatusMsg(res?.error || "Не удалось сохранить токен");
                setTimeout(() => setStatusMsg(""), 4000);
            }
        }
        catch (e) {
            console.error("Save Yandex token error:", e);
        }
        finally {
            setLoading(false);
        }
    };
    const handlePlayTrack = async (index) => {
        const t = tracks[index];
        const isCurrent = (t.id && status.track?.id === t.id) || (t.path && status.track?.path === t.path);
        if (isCurrent) {
            try {
                await rpcPlayPause();
                setTimeout(onRefresh, 150);
            }
            catch (e) {
                console.error("PlayPause error:", e);
            }
            return;
        }
        setLoadingTrackIdx(index);
        try {
            await rpcPlayQueue(tracks, index);
            setTimeout(onRefresh, 300);
        }
        catch (e) {
            console.error("Play error:", e);
        }
        finally {
            setTimeout(() => setLoadingTrackIdx(null), 1200);
        }
    };
    SP_REACT.useEffect(() => {
        loadStatus();
        loadDownloaded();
        const interval = setInterval(async () => {
            if (!yandexStatus.logged_in) {
                const s = await rpcYandexGetStatus();
                if (s.logged_in) {
                    setYandexStatus(s);
                    loadPlaylists();
                    try {
                        if (typeof DFL.Navigation?.NavigateBack === "function") {
                            DFL.Navigation.NavigateBack();
                        }
                        const sc = window.SteamClient;
                        if (typeof sc?.Overlay?.CloseOverlay === "function") {
                            sc.Overlay.CloseOverlay();
                        }
                    }
                    catch (e) { }
                }
                else if (s.user_code && s.user_code !== yandexStatus.user_code) {
                    setYandexStatus(s);
                }
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [yandexStatus.logged_in]);
    return (SP_JSX.jsxs("div", { style: {
            padding: "16px 20px",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            boxSizing: "border-box",
            overflowX: "hidden",
        }, children: [SP_JSX.jsx("style", { children: `
        @keyframes deckymus-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .deckymus-spin {
          animation: deckymus-spin 1s linear infinite;
        }
      ` }), SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 14px",
                                backgroundColor: "rgba(234, 179, 8, 0.12)",
                                border: "1px solid rgba(234, 179, 8, 0.3)",
                                borderRadius: "8px",
                                marginBottom: "12px",
                                fontSize: "12px",
                                color: "#fef08a",
                                width: "100%",
                                boxSizing: "border-box",
                            }, children: [SP_JSX.jsx("span", { style: {
                                        backgroundColor: "#eab308",
                                        color: "#000000",
                                        fontWeight: 700,
                                        fontSize: "10px",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        letterSpacing: "0.5px",
                                        flexShrink: 0,
                                    }, children: "BETA" }), SP_JSX.jsx("span", { children: t("betaNotice") })] }) }), yandexStatus.logged_in && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 14px",
                                backgroundColor: "rgba(250, 204, 21, 0.12)",
                                borderRadius: "10px",
                                border: "1px solid rgba(250, 204, 21, 0.25)",
                                width: "100%",
                                boxSizing: "border-box",
                                marginBottom: "14px",
                                gap: "12px",
                            }, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }, children: [yandexStatus.avatar ? (SP_JSX.jsx("img", { src: yandexStatus.avatar, alt: "Avatar", style: { width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 } })) : (SP_JSX.jsx("div", { style: {
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "50%",
                                            backgroundColor: "#facc15",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#000",
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }, children: "\u042F" })), SP_JSX.jsxs("div", { style: { minWidth: 0, overflow: "hidden" }, children: [SP_JSX.jsx("div", { style: {
                                                    fontSize: "14px",
                                                    fontWeight: 600,
                                                    color: "#f8fafc",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }, children: yandexStatus.user_name }), yandexStatus.user_id && (SP_JSX.jsxs("div", { style: {
                                                    fontSize: "11px",
                                                    color: "#94a3b8",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }, children: ["ID: ", yandexStatus.user_id] }))] })] }) }) })), !yandexStatus.logged_in && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "28px 16px",
                                textAlign: "center",
                                background: "linear-gradient(180deg, rgba(250, 204, 21, 0.15) 0%, rgba(18, 18, 18, 0.4) 100%)",
                                borderRadius: "12px",
                                border: "1px solid rgba(250, 204, 21, 0.3)",
                                margin: "8px 0 16px 0",
                                width: "100%",
                                boxSizing: "border-box",
                            }, children: [SP_JSX.jsx("div", { style: { marginBottom: "14px" }, children: SP_JSX.jsx(YandexMusicIcon, { size: 56 }) }), SP_JSX.jsx("div", { style: { fontSize: "18px", fontWeight: "bold", color: "#f8fafc", marginBottom: "8px" }, children: t("yandexAuthHeader") }), SP_JSX.jsx("div", { style: {
                                        fontSize: "13px",
                                        color: "#94a3b8",
                                        maxWidth: "460px",
                                        lineHeight: "1.5",
                                        marginBottom: "20px",
                                        whiteSpace: "pre-line",
                                    }, children: t("yandexInstructions") }), SP_JSX.jsxs("div", { style: {
                                        display: "flex",
                                        flexDirection: "row",
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "20px",
                                        marginBottom: "20px",
                                        width: "100%",
                                    }, children: [yandexStatus.qr_svg && (SP_JSX.jsx("div", { style: {
                                                width: "150px",
                                                height: "150px",
                                                backgroundColor: "#ffffff",
                                                padding: "8px",
                                                borderRadius: "12px",
                                                boxSizing: "border-box",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                                            }, children: SP_JSX.jsx("div", { dangerouslySetInnerHTML: { __html: yandexStatus.qr_svg }, style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } }) })), SP_JSX.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "10px", minWidth: "200px", alignItems: "center" }, children: [SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                                        width: "100%",
                                                        padding: "14px 20px",
                                                        backgroundColor: "#facc15",
                                                        color: "#000000",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: "8px",
                                                        fontWeight: 700,
                                                        borderRadius: "10px",
                                                        fontSize: "14px",
                                                    }, onClick: handleOpenBrowser, children: [SP_JSX.jsx(FaExternalLinkAlt, { size: 15 }), SP_JSX.jsx("span", { children: t("openInBrowser") })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#64748b", textAlign: "center" }, children: t("scanQrWithPhone") })] })] }), SP_JSX.jsxs("div", { style: { width: "100%", maxWidth: "460px", marginTop: "8px" }, children: [SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#94a3b8", marginBottom: "6px", textAlign: "left" }, children: t("pasteTokenOrUrl") }), SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: { display: "flex", alignItems: "center", gap: "8px", width: "100%" }, children: [SP_JSX.jsx("div", { style: { flex: 1 }, children: SP_JSX.jsx(DFL.TextField, { value: tokenInput, onChange: (e) => setTokenInput(e.target.value), placeholder: t("tokenFieldPlaceholder") || "access_token или ссылка" }) }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                                        minWidth: "40px",
                                                        width: "40px",
                                                        height: "40px",
                                                        padding: "0",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: "#22c55e",
                                                        color: "#ffffff",
                                                        borderRadius: "8px",
                                                        flexShrink: 0,
                                                    }, onClick: handleSaveToken, children: SP_JSX.jsx(FaCheck, { size: 14 }) })] })] })] }) })), statusMsg && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: {
                                width: "100%",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                backgroundColor: statusIsError
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : "rgba(34, 197, 94, 0.2)",
                                border: statusIsError
                                    ? "1px solid rgba(239, 68, 68, 0.5)"
                                    : "1px solid rgba(34, 197, 94, 0.5)",
                                color: statusIsError ? "#fca5a5" : "#86efac",
                                fontSize: "13px",
                                textAlign: "center",
                                marginBottom: "8px",
                            }, children: statusMsg }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: { display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", width: "100%" }, children: [SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", onClick: loadChart, style: {
                                        minWidth: "auto",
                                        whiteSpace: "nowrap",
                                        padding: "6px 12px",
                                        backgroundColor: selectedPlaylistId === "chart" ? "#facc15" : undefined,
                                        color: selectedPlaylistId === "chart" ? "#000" : undefined,
                                    }, children: [SP_JSX.jsx(FaChartLine, { size: 12, style: { marginRight: "6px" } }), t("chartTitle")] }), playlists.map((pl) => (SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", onClick: () => loadPlaylistTracks(pl.id, pl.owner_id || "", pl.title), style: {
                                        minWidth: "auto",
                                        whiteSpace: "nowrap",
                                        padding: "6px 12px",
                                        backgroundColor: selectedPlaylistId === pl.id ? "#facc15" : undefined,
                                        color: selectedPlaylistId === pl.id ? "#000" : undefined,
                                    }, children: [pl.id === "likes" ? (SP_JSX.jsx(FaHeart, { size: 12, style: { marginRight: "6px" } })) : (SP_JSX.jsx(FaListUl, { size: 12, style: { marginRight: "6px" } })), pl.title, " (", pl.track_count, ")"] }, pl.id)))] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { width: "100%", display: "flex", flexDirection: "column", gap: "6px", padding: "4px 6px", boxSizing: "border-box" }, children: [SP_JSX.jsxs("div", { style: { fontSize: "13px", fontWeight: "bold", color: "#f8fafc", marginBottom: "6px" }, children: [selectedPlaylistId === "chart" ? t("chartTitle") : selectedPlaylistName, " (", tracks.length, ")"] }), loading && (SP_JSX.jsx("div", { style: { padding: "24px", textAlign: "center", color: "#94a3b8" }, children: t("loadingTracks") })), !loading && tracks.map((t, idx) => {
                                    const isCurrent = (t.id && status.track?.id === t.id) || (t.path && status.track?.path === t.path);
                                    const isPlaying = isCurrent && status.playback_status === "Playing";
                                    const isCurrentPaused = isCurrent && status.playback_status === "Paused";
                                    const isLoadingThis = loadingTrackIdx === idx;
                                    const isDown = isDownloaded(t);
                                    const isDowning = downloadingIds.has(String(t.id));
                                    return (SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            width: "100%",
                                            boxSizing: "border-box",
                                        }, children: [SP_JSX.jsxs(DFL.Focusable, { className: "deckymus-focus-btn", onActivate: () => {
                                                    if (isPlaying) {
                                                        rpcPlayPause().then(onRefresh);
                                                    }
                                                    else if (isCurrentPaused) {
                                                        rpcPlayPause().then(onRefresh);
                                                    }
                                                    else {
                                                        handlePlayTrack(idx);
                                                    }
                                                }, style: {
                                                    flex: 1,
                                                    minWidth: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    padding: "8px 12px",
                                                    backgroundColor: isPlaying
                                                        ? "rgba(250, 204, 21, 0.2)"
                                                        : "rgba(255, 255, 255, 0.03)",
                                                    border: isPlaying ? "1px solid #facc15" : "1px solid rgba(255, 255, 255, 0.06)",
                                                    borderRadius: "8px",
                                                    gap: "10px",
                                                    cursor: "pointer",
                                                }, children: [SP_JSX.jsx("div", { style: {
                                                            minWidth: "36px",
                                                            width: "36px",
                                                            height: "36px",
                                                            borderRadius: "50%",
                                                            backgroundColor: isPlaying ? "#facc15" : "rgba(255, 255, 255, 0.1)",
                                                            color: isPlaying ? "#000" : "#fff",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }, children: isLoadingThis ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 12 })) : isPlaying ? (SP_JSX.jsx(FaPause, { size: 12 })) : (SP_JSX.jsx(FaPlay, { size: 12, style: { marginLeft: "2px" } })) }), t.art_url ? (SP_JSX.jsx("img", { src: t.art_url, alt: "", style: { width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 } })) : (SP_JSX.jsx("div", { style: {
                                                            width: "38px",
                                                            height: "38px",
                                                            borderRadius: "6px",
                                                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#facc15",
                                                            flexShrink: 0,
                                                        }, children: SP_JSX.jsx(YandexMusicIcon, { size: 20 }) })), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0, overflow: "hidden" }, children: [SP_JSX.jsx("div", { style: {
                                                                    fontSize: "14px",
                                                                    fontWeight: 600,
                                                                    color: isPlaying ? "#facc15" : "#f8fafc",
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                }, children: t.title }), SP_JSX.jsx("div", { style: {
                                                                    fontSize: "12px",
                                                                    color: "#94a3b8",
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                }, children: t.artist })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#64748b", minWidth: "40px", textAlign: "right", flexShrink: 0 }, children: formatDuration$2(t.duration) })] }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                                    minWidth: "36px",
                                                    width: "36px",
                                                    height: "44px",
                                                    padding: "0",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "8px",
                                                    backgroundColor: isDown
                                                        ? "rgba(34, 197, 94, 0.2)"
                                                        : "rgba(255, 255, 255, 0.06)",
                                                    border: isDown ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                                                    color: isDown ? "#4ade80" : "#cbd5e1",
                                                    flexShrink: 0,
                                                }, disabled: isDowning, onClick: () => handleDownload(t), children: isDowning ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 12 })) : isDown ? (SP_JSX.jsx(FaCheck, { size: 12 })) : (SP_JSX.jsx(FaDownload, { size: 12 })) })] }, t.id || idx));
                                })] }) })] })] }));
};

// Module-level persistent cache across tab navigation
let cachedQuery = "";
let cachedTracks = [];
let cachedHasSearched = false;
const formatDuration$1 = (seconds) => {
    if (!seconds || seconds <= 0)
        return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
};
const YouTubeMusicTab = ({ status, onRefresh }) => {
    const { t } = useTranslation();
    const [query, setQuery] = SP_REACT.useState(cachedQuery);
    const [tracks, setTracks] = SP_REACT.useState(cachedTracks);
    const [loading, setLoading] = SP_REACT.useState(false);
    const [hasSearched, setHasSearched] = SP_REACT.useState(cachedHasSearched);
    const [loadingTrackIdx, setLoadingTrackIdx] = SP_REACT.useState(null);
    const [statusMsg, setStatusMsg] = SP_REACT.useState("");
    const [statusIsError, setStatusIsError] = SP_REACT.useState(false);
    SP_REACT.useRef(null);
    // Download state tracking
    const [downloadedIds, setDownloadedIds] = SP_REACT.useState(new Set());
    const [downloadedNames, setDownloadedNames] = SP_REACT.useState(new Set());
    const [downloadingIds, setDownloadingIds] = SP_REACT.useState(new Set());
    const loadDownloaded = async () => {
        try {
            const info = await rpcGetDownloadedInfo();
            if (info) {
                setDownloadedIds(new Set(info.ids || []));
                setDownloadedNames(new Set(info.filenames || []));
            }
        }
        catch (e) {
            console.error("loadDownloaded error:", e);
        }
    };
    const isDownloaded = (item) => {
        if (item.id && downloadedIds.has(String(item.id)))
            return true;
        const cleanT = (item.title || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
        const cleanA = (item.artist || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
        const full = cleanA ? `${cleanA} - ${cleanT}` : cleanT;
        return downloadedNames.has(full) || downloadedNames.has(cleanT);
    };
    const handleDownload = async (item) => {
        const tid = String(item.id);
        setDownloadingIds((prev) => new Set(prev).add(tid));
        setStatusIsError(false);
        setStatusMsg(t("downloadingTrack", item.title));
        try {
            const res = await rpcDownloadTrack(item);
            if (res && res.success) {
                setDownloadedIds((prev) => new Set(prev).add(tid));
                const cleanT = (item.title || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
                const cleanA = (item.artist || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
                const full = cleanA ? `${cleanA} - ${cleanT}` : cleanT;
                setDownloadedNames((prev) => new Set(prev).add(full));
                setStatusIsError(false);
                setStatusMsg(t("downloadSuccess", item.title));
                setTimeout(() => setStatusMsg(""), 4000);
            }
            else {
                setStatusIsError(true);
                setStatusMsg(t("downloadError", res?.error || "Error"));
                setTimeout(() => setStatusMsg(""), 4000);
            }
        }
        catch (e) {
            console.error("Download exception:", e);
            setStatusIsError(true);
            setStatusMsg(t("downloadError", "Exception"));
            setTimeout(() => setStatusMsg(""), 4000);
        }
        finally {
            setDownloadingIds((prev) => {
                const next = new Set(prev);
                next.delete(tid);
                return next;
            });
        }
    };
    const handleSearch = async () => {
        if (!query.trim())
            return;
        setLoading(true);
        setHasSearched(true);
        cachedQuery = query;
        cachedHasSearched = true;
        try {
            const res = await rpcYtSearch(query.trim());
            const list = res || [];
            setTracks(list);
            cachedTracks = list;
            loadDownloaded();
        }
        catch (e) {
            console.error("YT search error:", e);
        }
        finally {
            setLoading(false);
        }
    };
    const handlePlayTrack = async (index) => {
        const t = tracks[index];
        const isCurrent = status.track?.id === t.id;
        if (isCurrent) {
            try {
                await rpcPlayPause();
                setTimeout(onRefresh, 150);
            }
            catch (e) {
                console.error("PlayPause error:", e);
            }
            return;
        }
        setLoadingTrackIdx(index);
        try {
            await rpcPlayQueue(tracks, index);
            setTimeout(onRefresh, 300);
        }
        catch (e) {
            console.error("Play error:", e);
        }
        finally {
            setTimeout(() => setLoadingTrackIdx(null), 1500);
        }
    };
    SP_REACT.useEffect(() => {
        loadDownloaded();
    }, []);
    return (SP_JSX.jsxs("div", { style: {
            padding: "16px 20px",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            boxSizing: "border-box",
            overflowX: "hidden",
        }, children: [SP_JSX.jsx("style", { children: `
        @keyframes deckymus-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .deckymus-spin {
          animation: deckymus-spin 1s linear infinite;
        }
      ` }), SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                                display: "flex",
                                gap: "8px",
                                width: "100%",
                                marginBottom: "12px",
                                alignItems: "center",
                            }, children: [SP_JSX.jsx("div", { style: { flex: 1, minWidth: 0 }, children: SP_JSX.jsx(DFL.TextField, { value: query, onChange: (e) => {
                                            const val = e?.target?.value || "";
                                            setQuery(val);
                                            cachedQuery = val;
                                        }, placeholder: t("ytSearchPlaceholder"), onKeyDown: (e) => {
                                            if (e.key === "Enter")
                                                handleSearch();
                                        } }) }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn deckymus-search-btn", disabled: loading || !query.trim(), onClick: handleSearch, style: {
                                        width: "40px",
                                        minWidth: "40px",
                                        height: "40px",
                                        padding: "0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(239, 68, 68, 0.3)",
                                        flexShrink: 0,
                                    }, children: loading ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 14 })) : (SP_JSX.jsx(FaSearch, { size: 14 })) })] }) }), statusMsg && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: {
                                width: "100%",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                backgroundColor: statusIsError
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : "rgba(34, 197, 94, 0.2)",
                                border: statusIsError
                                    ? "1px solid rgba(239, 68, 68, 0.5)"
                                    : "1px solid rgba(34, 197, 94, 0.5)",
                                color: statusIsError ? "#fca5a5" : "#86efac",
                                fontSize: "13px",
                                textAlign: "center",
                                marginBottom: "8px",
                            }, children: statusMsg }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                width: "100%",
                                minWidth: 0,
                                maxWidth: "100%",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                                padding: "4px 6px",
                                boxSizing: "border-box",
                            }, children: [loading && (SP_JSX.jsx("div", { style: { padding: "32px", textAlign: "center", color: "#94a3b8" }, children: t("ytSearching") })), !loading && hasSearched && tracks.length === 0 && (SP_JSX.jsx("div", { style: {
                                        padding: "32px",
                                        textAlign: "center",
                                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                                        borderRadius: "8px",
                                        color: "#94a3b8",
                                    }, children: t("nothingFound") })), !loading && !hasSearched && (SP_JSX.jsxs("div", { style: {
                                        padding: "32px",
                                        textAlign: "center",
                                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                                        borderRadius: "8px",
                                        color: "#94a3b8",
                                    }, children: [SP_JSX.jsx(FaYoutube, { size: 36, color: "#ef4444", style: { marginBottom: "8px", opacity: 0.8 } }), SP_JSX.jsx("div", { children: t("ytEnterQueryHint") })] })), !loading && tracks.map((t, idx) => {
                                    const isCurrent = status.track?.id === t.id;
                                    const isPlaying = isCurrent && status.playback_status === "Playing";
                                    const isCurrentPaused = isCurrent && status.playback_status === "Paused";
                                    const isLoadingThis = loadingTrackIdx === idx;
                                    const isDown = isDownloaded(t);
                                    const isDowning = downloadingIds.has(String(t.id));
                                    return (SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            width: "100%",
                                            boxSizing: "border-box",
                                        }, children: [SP_JSX.jsxs(DFL.Focusable, { className: "deckymus-focus-btn", onActivate: () => {
                                                    if (isPlaying) {
                                                        rpcPlayPause().then(onRefresh);
                                                    }
                                                    else if (isCurrentPaused) {
                                                        rpcPlayPause().then(onRefresh);
                                                    }
                                                    else {
                                                        handlePlayTrack(idx);
                                                    }
                                                }, style: {
                                                    flex: 1,
                                                    minWidth: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    padding: "8px 12px",
                                                    backgroundColor: isPlaying
                                                        ? "rgba(239, 68, 68, 0.2)"
                                                        : "rgba(255, 255, 255, 0.03)",
                                                    border: isPlaying ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.06)",
                                                    borderRadius: "8px",
                                                    gap: "10px",
                                                    cursor: "pointer",
                                                }, children: [SP_JSX.jsx("div", { style: {
                                                            minWidth: "36px",
                                                            width: "36px",
                                                            height: "36px",
                                                            borderRadius: "50%",
                                                            backgroundColor: isPlaying ? "#ef4444" : "rgba(255, 255, 255, 0.1)",
                                                            color: "#fff",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }, children: isLoadingThis ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 12 })) : isPlaying ? (SP_JSX.jsx(FaPause, { size: 12 })) : (SP_JSX.jsx(FaPlay, { size: 12, style: { marginLeft: "2px" } })) }), t.art_url ? (SP_JSX.jsx("img", { src: t.art_url, alt: "", style: { width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 } })) : (SP_JSX.jsx("div", { style: {
                                                            width: "38px",
                                                            height: "38px",
                                                            borderRadius: "6px",
                                                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#ef4444",
                                                            flexShrink: 0,
                                                        }, children: SP_JSX.jsx(FaYoutube, { size: 18 }) })), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0, overflow: "hidden" }, children: [SP_JSX.jsx("div", { style: {
                                                                    fontSize: "14px",
                                                                    fontWeight: 600,
                                                                    color: isPlaying ? "#f87171" : "#f8fafc",
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                }, children: t.title }), SP_JSX.jsx("div", { style: {
                                                                    fontSize: "12px",
                                                                    color: "#94a3b8",
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                }, children: t.artist })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#64748b", minWidth: "40px", textAlign: "right", flexShrink: 0 }, children: formatDuration$1(t.duration) })] }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                                    minWidth: "36px",
                                                    width: "36px",
                                                    height: "44px",
                                                    padding: "0",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "8px",
                                                    backgroundColor: isDown
                                                        ? "rgba(34, 197, 94, 0.2)"
                                                        : "rgba(255, 255, 255, 0.06)",
                                                    border: isDown ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                                                    color: isDown ? "#4ade80" : "#cbd5e1",
                                                    flexShrink: 0,
                                                }, disabled: isDowning, onClick: () => handleDownload(t), children: isDowning ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 12 })) : isDown ? (SP_JSX.jsx(FaCheck, { size: 12 })) : (SP_JSX.jsx(FaDownload, { size: 12 })) })] }, t.id || idx));
                                })] }) })] })] }));
};

// Persistent caches
let cachedSpotifyLiked = [];
let cachedSpotifyPlaylists = [];
let cachedSpotifyView = "liked";
let cachedSpotifySearchQuery = "";
let cachedSpotifySearchResults = [];
const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0)
        return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
};
const SpotifyTab = ({ status, onRefresh }) => {
    const { t } = useTranslation();
    const [spotifyStatus, setSpotifyStatus] = SP_REACT.useState({
        has_token: false,
        logged_in: false,
        user_name: "",
    });
    const [activeView, setActiveView] = SP_REACT.useState(cachedSpotifyView);
    const [likedTracks, setLikedTracks] = SP_REACT.useState(cachedSpotifyLiked);
    const [playlists, setPlaylists] = SP_REACT.useState(cachedSpotifyPlaylists);
    const [selectedPlaylist, setSelectedPlaylist] = SP_REACT.useState(null);
    const [playlistTracks, setPlaylistTracks] = SP_REACT.useState([]);
    const [searchQuery, setSearchQuery] = SP_REACT.useState(cachedSpotifySearchQuery);
    const [searchResults, setSearchResults] = SP_REACT.useState(cachedSpotifySearchResults);
    const [loading, setLoading] = SP_REACT.useState(false);
    const [statusMsg, setStatusMsg] = SP_REACT.useState("");
    const [statusIsError, setStatusIsError] = SP_REACT.useState(false);
    const [loadingTrackIdx, setLoadingTrackIdx] = SP_REACT.useState(null);
    // Downloads tracking
    const [downloadedIds, setDownloadedIds] = SP_REACT.useState(new Set());
    const [downloadedNames, setDownloadedNames] = SP_REACT.useState(new Set());
    const [downloadingIds, setDownloadingIds] = SP_REACT.useState(new Set());
    const loadDownloaded = async () => {
        try {
            const info = await rpcGetDownloadedInfo();
            if (info) {
                setDownloadedIds(new Set(info.ids || []));
                setDownloadedNames(new Set(info.filenames || []));
            }
        }
        catch (e) {
            console.error("loadDownloaded error:", e);
        }
    };
    const isDownloaded = (item) => {
        if (item.id && downloadedIds.has(String(item.id)))
            return true;
        const cleanT = (item.title || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
        const cleanA = (item.artist || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
        const full = cleanA ? `${cleanA} - ${cleanT}` : cleanT;
        return downloadedNames.has(full) || downloadedNames.has(cleanT);
    };
    const handleDownload = async (item) => {
        const tid = String(item.id);
        setDownloadingIds((prev) => new Set(prev).add(tid));
        setStatusIsError(false);
        setStatusMsg(t("downloadingTrack", item.title));
        try {
            const res = await rpcDownloadTrack(item);
            if (res && res.success) {
                setDownloadedIds((prev) => new Set(prev).add(tid));
                const cleanT = (item.title || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
                const cleanA = (item.artist || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
                const full = cleanA ? `${cleanA} - ${cleanT}` : cleanT;
                setDownloadedNames((prev) => new Set(prev).add(full));
                setStatusIsError(false);
                setStatusMsg(t("downloadSuccess", item.title));
                setTimeout(() => setStatusMsg(""), 4000);
            }
            else {
                setStatusIsError(true);
                setStatusMsg(t("downloadError", res?.error || "Error"));
                setTimeout(() => setStatusMsg(""), 4000);
            }
        }
        catch (e) {
            console.error("Download exception:", e);
            setStatusIsError(true);
            setStatusMsg(t("downloadError", "Exception"));
            setTimeout(() => setStatusMsg(""), 4000);
        }
        finally {
            setDownloadingIds((prev) => {
                const next = new Set(prev);
                next.delete(tid);
                return next;
            });
        }
    };
    const loadStatus = async () => {
        try {
            const s = await rpcSpotifyGetStatus();
            setSpotifyStatus(s);
            if (s.logged_in) {
                if (cachedSpotifyLiked.length === 0) {
                    loadLikedTracks();
                }
            }
        }
        catch (e) {
            console.error("Spotify status error:", e);
        }
    };
    const loadLikedTracks = async () => {
        setLoading(true);
        try {
            const res = await rpcSpotifyGetLikedTracks(0, 50);
            const list = res || [];
            setLikedTracks(list);
            cachedSpotifyLiked = list;
        }
        catch (e) {
            console.error("loadLikedTracks error:", e);
        }
        finally {
            setLoading(false);
        }
    };
    const loadPlaylists = async () => {
        setLoading(true);
        try {
            const res = await rpcSpotifyGetPlaylists(0, 50);
            const list = res || [];
            setPlaylists(list);
            cachedSpotifyPlaylists = list;
        }
        catch (e) {
            console.error("loadPlaylists error:", e);
        }
        finally {
            setLoading(false);
        }
    };
    const openPlaylist = async (pl) => {
        setSelectedPlaylist(pl);
        setActiveView("playlist_tracks");
        setLoading(true);
        try {
            const res = await rpcSpotifyGetPlaylistTracks(pl.id, 0, 100);
            setPlaylistTracks(res || []);
        }
        catch (e) {
            console.error("openPlaylist error:", e);
            setPlaylistTracks([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSearch = async () => {
        const q = searchQuery.trim();
        if (!q)
            return;
        setLoading(true);
        setActiveView("search");
        cachedSpotifyView = "search";
        cachedSpotifySearchQuery = q;
        try {
            const res = await rpcSpotifySearch(q, 0, 50);
            const list = res || [];
            setSearchResults(list);
            cachedSpotifySearchResults = list;
        }
        catch (e) {
            console.error("Spotify search error:", e);
            setSearchResults([]);
        }
        finally {
            setLoading(false);
        }
    };
    const openBrowser = async () => {
        if (spotifyStatus.auth_url) {
            await openExternalAuthUrl(spotifyStatus.auth_url);
        }
    };
    const handleOpenBrowser = openBrowser;
    const handlePlayTrack = async (targetList, index) => {
        setLoadingTrackIdx(index);
        try {
            await rpcPlayQueue(targetList, index);
            onRefresh();
        }
        catch (e) {
            console.error("handlePlayTrack error:", e);
        }
        finally {
            setLoadingTrackIdx(null);
        }
    };
    SP_REACT.useRef(null);
    SP_REACT.useEffect(() => {
        loadStatus();
        loadDownloaded();
        const interval = setInterval(async () => {
            // Periodically check if logged in via phone helper or browser session
            if (!spotifyStatus.logged_in) {
                const s = await rpcSpotifyGetStatus();
                if (s.logged_in) {
                    setSpotifyStatus(s);
                    loadLikedTracks();
                    try {
                        if (typeof DFL.Navigation?.NavigateBack === "function") {
                            DFL.Navigation.NavigateBack();
                        }
                        const sc = window.SteamClient;
                        if (typeof sc?.Overlay?.CloseOverlay === "function") {
                            sc.Overlay.CloseOverlay();
                        }
                    }
                    catch (e) { }
                }
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [spotifyStatus.logged_in]);
    const currentList = activeView === "liked"
        ? likedTracks
        : activeView === "playlist_tracks"
            ? playlistTracks
            : searchResults;
    return (SP_JSX.jsx("div", { style: {
            padding: "16px 20px",
            width: "100%",
            maxWidth: "850px",
            margin: "0 auto",
            boxSizing: "border-box",
            overflowX: "hidden",
        }, children: SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 14px",
                            backgroundColor: "rgba(234, 179, 8, 0.12)",
                            border: "1px solid rgba(234, 179, 8, 0.3)",
                            borderRadius: "8px",
                            marginBottom: "12px",
                            fontSize: "12px",
                            color: "#fef08a",
                            width: "100%",
                            boxSizing: "border-box",
                        }, children: [SP_JSX.jsx("span", { style: {
                                    backgroundColor: "#eab308",
                                    color: "#000000",
                                    fontWeight: 700,
                                    fontSize: "10px",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    letterSpacing: "0.5px",
                                    flexShrink: 0,
                                }, children: "BETA" }), SP_JSX.jsx("span", { children: t("betaNotice") })] }) }), statusMsg && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            backgroundColor: statusIsError ? "rgba(239, 68, 68, 0.2)" : "rgba(30, 215, 96, 0.2)",
                            border: `1px solid ${statusIsError ? "rgba(239, 68, 68, 0.4)" : "rgba(30, 215, 96, 0.4)"}`,
                            color: statusIsError ? "#f87171" : "#1ed760",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "12px",
                        }, children: [SP_JSX.jsx("span", { children: statusMsg }), SP_JSX.jsx(DFL.DialogButton, { style: { minWidth: "40px", padding: "4px 8px", fontSize: "11px" }, onClick: () => setStatusMsg(""), children: "\u2715" })] }) })), !spotifyStatus.logged_in ? (SP_JSX.jsx(SP_JSX.Fragment, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                padding: "24px 20px",
                                backgroundColor: "rgba(30, 215, 96, 0.08)",
                                borderRadius: "14px",
                                border: "1px solid rgba(30, 215, 96, 0.25)",
                                width: "100%",
                                boxSizing: "border-box",
                                marginBottom: "16px",
                                textAlign: "center",
                            }, children: [SP_JSX.jsx("div", { style: {
                                        width: "64px",
                                        height: "64px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "transparent",
                                        marginBottom: "12px",
                                    }, children: SP_JSX.jsx(SpotifyIcon, { size: 56 }) }), SP_JSX.jsx("div", { style: { fontSize: "18px", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }, children: t("spotifyAuthHeader") }), SP_JSX.jsx("div", { style: {
                                        fontSize: "13px",
                                        color: "#94a3b8",
                                        maxWidth: "500px",
                                        lineHeight: "1.5",
                                        whiteSpace: "pre-line",
                                        marginBottom: "20px",
                                    }, children: t("spotifyInstructions") }), SP_JSX.jsxs("div", { style: {
                                        display: "flex",
                                        flexDirection: "row",
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "24px",
                                        marginBottom: "20px",
                                        width: "100%",
                                    }, children: [spotifyStatus.qr_svg && (SP_JSX.jsx("div", { style: {
                                                width: "170px",
                                                height: "170px",
                                                backgroundColor: "#ffffff",
                                                padding: "10px",
                                                borderRadius: "14px",
                                                boxSizing: "border-box",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                                            }, children: SP_JSX.jsx("div", { dangerouslySetInnerHTML: { __html: spotifyStatus.qr_svg }, style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } }) })), SP_JSX.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }, children: SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                                    padding: "12px 18px",
                                                    backgroundColor: "#1ed760",
                                                    color: "#000000",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "8px",
                                                    fontWeight: 700,
                                                    borderRadius: "8px",
                                                }, onClick: handleOpenBrowser, children: [SP_JSX.jsx(FaExternalLinkAlt, { size: 14 }), SP_JSX.jsx("span", { children: t("openInBrowser") })] }) })] })] }) }) })) : (
                /* LOGGED IN: Full Spotify Experience */
                SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px 16px",
                                    backgroundColor: "rgba(30, 215, 96, 0.12)",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(30, 215, 96, 0.3)",
                                    width: "100%",
                                    boxSizing: "border-box",
                                    marginBottom: "14px",
                                }, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }, children: [spotifyStatus.avatar ? (SP_JSX.jsx("img", { src: spotifyStatus.avatar, alt: "Avatar", style: { width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 } })) : (SP_JSX.jsx("div", { style: {
                                                width: "38px",
                                                height: "38px",
                                                borderRadius: "50%",
                                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }, children: SP_JSX.jsx(SpotifyIcon, { size: 28 }) })), SP_JSX.jsxs("div", { style: { minWidth: 0, overflow: "hidden" }, children: [SP_JSX.jsx("div", { style: {
                                                        fontSize: "15px",
                                                        fontWeight: 600,
                                                        color: "#f8fafc",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }, children: spotifyStatus.user_name }), SP_JSX.jsxs("div", { style: {
                                                        fontSize: "11px",
                                                        color: "#1ed760",
                                                        textTransform: "capitalize",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }, children: ["Spotify ", spotifyStatus.product || "Connected"] })] })] }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: { display: "flex", gap: "8px", width: "100%", marginBottom: "12px", alignItems: "center" }, children: [SP_JSX.jsx("div", { style: { flex: 1, minWidth: 0 }, children: SP_JSX.jsx(DFL.TextField, { value: searchQuery, onChange: (e) => setSearchQuery(e?.target?.value || ""), placeholder: t("searchSpotifyPlaceholder"), onKeyDown: (e) => {
                                                if (e.key === "Enter")
                                                    handleSearch();
                                            } }) }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn deckymus-search-btn", style: {
                                            width: "40px",
                                            minWidth: "40px",
                                            height: "40px",
                                            padding: "0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "8px",
                                            flexShrink: 0,
                                        }, onClick: handleSearch, disabled: loading, children: loading && activeView === "search" ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 14 })) : (SP_JSX.jsx(FaSearch, { size: 14 })) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: { display: "flex", gap: "8px", width: "100%", marginBottom: "16px" }, children: [SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                            flex: 1,
                                            padding: "8px 12px",
                                            backgroundColor: activeView === "liked" ? "rgba(30, 215, 96, 0.3)" : "rgba(255, 255, 255, 0.05)",
                                            border: activeView === "liked" ? "1px solid #1ed760" : "1px solid transparent",
                                            fontWeight: activeView === "liked" ? 700 : 500,
                                        }, onClick: () => {
                                            setActiveView("liked");
                                            cachedSpotifyView = "liked";
                                            if (likedTracks.length === 0)
                                                loadLikedTracks();
                                        }, children: [SP_JSX.jsx(FaHeart, { size: 12, style: { marginRight: "6px", color: "#1ed760" } }), SP_JSX.jsx("span", { children: t("likedTracks") })] }), SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                            flex: 1,
                                            padding: "8px 12px",
                                            backgroundColor: activeView === "playlists" || activeView === "playlist_tracks"
                                                ? "rgba(30, 215, 96, 0.3)"
                                                : "rgba(255, 255, 255, 0.05)",
                                            border: activeView === "playlists" || activeView === "playlist_tracks"
                                                ? "1px solid #1ed760"
                                                : "1px solid transparent",
                                            fontWeight: activeView === "playlists" || activeView === "playlist_tracks" ? 700 : 500,
                                        }, onClick: () => {
                                            setActiveView("playlists");
                                            cachedSpotifyView = "playlists";
                                            if (playlists.length === 0)
                                                loadPlaylists();
                                        }, children: [SP_JSX.jsx(FaListUl, { size: 12, style: { marginRight: "6px" } }), SP_JSX.jsx("span", { children: t("myPlaylists") })] }), searchResults.length > 0 && (SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                            flex: 1,
                                            padding: "8px 12px",
                                            backgroundColor: activeView === "search" ? "rgba(30, 215, 96, 0.3)" : "rgba(255, 255, 255, 0.05)",
                                            border: activeView === "search" ? "1px solid #1ed760" : "1px solid transparent",
                                            fontWeight: activeView === "search" ? 700 : 500,
                                        }, onClick: () => {
                                            setActiveView("search");
                                            cachedSpotifyView = "search";
                                        }, children: [SP_JSX.jsx(FaSearch, { size: 12, style: { marginRight: "6px" } }), SP_JSX.jsx("span", { children: t("searchResults") })] }))] }) }), activeView === "playlist_tracks" && selectedPlaylist && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    marginBottom: "12px",
                                }, children: [SP_JSX.jsxs(DFL.DialogButton, { style: { padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }, onClick: () => setActiveView("playlists"), children: [SP_JSX.jsx(FaArrowLeft, { size: 11 }), SP_JSX.jsx("span", { children: t("backToPlaylists") })] }), SP_JSX.jsx("span", { style: { fontSize: "14px", fontWeight: 700, color: "#f8fafc" }, children: selectedPlaylist.title })] }) })), activeView === "playlists" && (SP_JSX.jsx(DFL.PanelSectionRow, { children: playlists.length === 0 && !loading ? (SP_JSX.jsx("div", { style: { textAlign: "center", padding: "30px", color: "#94a3b8", width: "100%" }, children: t("noPlaylistsFound") })) : (SP_JSX.jsx("div", { style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                                    gap: "12px",
                                    width: "100%",
                                }, children: playlists.map((pl) => (SP_JSX.jsxs("div", { tabIndex: 0, className: "deckymus-playlist-card", onClick: () => openPlaylist(pl), onKeyDown: (e) => {
                                        if (e.key === "Enter")
                                            openPlaylist(pl);
                                    }, style: {
                                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                                        border: "1px solid rgba(255, 255, 255, 0.08)",
                                        borderRadius: "10px",
                                        padding: "10px",
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        textAlign: "center",
                                        transition: "background-color 0.2s",
                                    }, children: [pl.cover ? (SP_JSX.jsx("img", { src: pl.cover, alt: pl.title, style: {
                                                width: "100%",
                                                aspectRatio: "1/1",
                                                borderRadius: "8px",
                                                objectFit: "cover",
                                                marginBottom: "8px",
                                            } })) : (SP_JSX.jsx("div", { style: {
                                                width: "100%",
                                                aspectRatio: "1/1",
                                                borderRadius: "8px",
                                                backgroundColor: "rgba(30, 215, 96, 0.15)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginBottom: "8px",
                                            }, children: SP_JSX.jsx(SpotifyIcon, { size: 36 }) })), SP_JSX.jsx("div", { style: {
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                color: "#f8fafc",
                                                width: "100%",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }, children: pl.title }), SP_JSX.jsx("div", { style: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" }, children: t("trackCount", pl.track_count) })] }, pl.id))) })) })), activeView !== "playlists" && (SP_JSX.jsx(DFL.PanelSectionRow, { children: loading && currentList.length === 0 ? (SP_JSX.jsxs("div", { style: { textAlign: "center", padding: "40px", color: "#94a3b8", width: "100%" }, children: [SP_JSX.jsx(FaSpinner, { className: "spin", size: 24, style: { marginBottom: "10px" } }), SP_JSX.jsx("div", { children: t("loading") })] })) : currentList.length === 0 ? (SP_JSX.jsx("div", { style: { textAlign: "center", padding: "40px", color: "#94a3b8", width: "100%" }, children: t("noTracksFound") })) : (SP_JSX.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "6px", width: "100%", padding: "4px 6px", boxSizing: "border-box" }, children: currentList.map((track, idx) => {
                                    const isPlaying = status.playback_status === "Playing" &&
                                        status.track?.title === track.title &&
                                        status.track?.artist === track.artist;
                                    const isCurrentPaused = status.playback_status === "Paused" &&
                                        status.track?.title === track.title &&
                                        status.track?.artist === track.artist;
                                    const downloaded = isDownloaded(track);
                                    const downloading = downloadingIds.has(String(track.id));
                                    return (SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            width: "100%",
                                            boxSizing: "border-box",
                                        }, children: [SP_JSX.jsxs(DFL.Focusable, { className: "deckymus-focus-btn", onActivate: () => {
                                                    if (isPlaying) {
                                                        rpcPlayPause().then(onRefresh);
                                                    }
                                                    else if (isCurrentPaused) {
                                                        rpcPlayPause().then(onRefresh);
                                                    }
                                                    else {
                                                        handlePlayTrack(currentList, idx);
                                                    }
                                                }, style: {
                                                    flex: 1,
                                                    minWidth: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    padding: "8px 12px",
                                                    backgroundColor: isPlaying
                                                        ? "rgba(30, 215, 96, 0.18)"
                                                        : "rgba(255, 255, 255, 0.03)",
                                                    border: isPlaying ? "1px solid #1ed760" : "1px solid rgba(255, 255, 255, 0.06)",
                                                    borderRadius: "8px",
                                                    gap: "10px",
                                                    cursor: "pointer",
                                                }, children: [SP_JSX.jsx("div", { style: {
                                                            minWidth: "36px",
                                                            width: "36px",
                                                            height: "36px",
                                                            borderRadius: "50%",
                                                            backgroundColor: isPlaying ? "#1ed760" : "rgba(255, 255, 255, 0.1)",
                                                            color: isPlaying ? "#000" : "#fff",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }, children: loadingTrackIdx === idx ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 12 })) : isPlaying ? (SP_JSX.jsx(FaPause, { size: 12 })) : (SP_JSX.jsx(FaPlay, { size: 12, style: { marginLeft: "2px" } })) }), track.art_url ? (SP_JSX.jsx("img", { src: track.art_url, alt: track.title, style: { width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 } })) : (SP_JSX.jsx("div", { style: {
                                                            width: "38px",
                                                            height: "38px",
                                                            borderRadius: "6px",
                                                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }, children: SP_JSX.jsx(SpotifyIcon, { size: 20 }) })), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [SP_JSX.jsx("div", { style: {
                                                                    fontSize: "14px",
                                                                    fontWeight: 600,
                                                                    color: isPlaying ? "#1ed760" : "#f8fafc",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }, children: track.title }), SP_JSX.jsx("div", { style: {
                                                                    fontSize: "12px",
                                                                    color: "#94a3b8",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }, children: track.artist || t("unknownArtist") })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#64748b", minWidth: "40px", textAlign: "right", flexShrink: 0 }, children: formatDuration(track.duration) })] }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn", style: {
                                                    minWidth: "36px",
                                                    width: "36px",
                                                    height: "44px",
                                                    padding: "0",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "8px",
                                                    backgroundColor: downloaded
                                                        ? "rgba(34, 197, 94, 0.2)"
                                                        : "rgba(255, 255, 255, 0.06)",
                                                    border: downloaded ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                                                    color: downloaded ? "#4ade80" : "#cbd5e1",
                                                    flexShrink: 0,
                                                }, disabled: downloading, onClick: () => handleDownload(track), children: downloading ? (SP_JSX.jsx(FaSpinner, { className: "spin", size: 12 })) : downloaded ? (SP_JSX.jsx(FaCheck, { size: 12 })) : (SP_JSX.jsx(FaDownload, { size: 12 })) })] }, `${track.id || idx}_${track.title}`));
                                }) })) }))] }))] }) }));
};

const SettingsTab = () => {
    const { t, selectedCode, setLanguage } = useTranslation();
    const [folders, setFolders] = SP_REACT.useState([]);
    const [downloadFolder, setDownloadFolder] = SP_REACT.useState("");
    const [saved, setSaved] = SP_REACT.useState(false);
    const [dlSaved, setDlSaved] = SP_REACT.useState(false);
    // Accounts state
    const [vkStatus, setVkStatus] = SP_REACT.useState(null);
    const [yandexStatus, setYandexStatus] = SP_REACT.useState(null);
    const [spotifyStatus, setSpotifyStatus] = SP_REACT.useState(null);
    const [loggingOutService, setLoggingOutService] = SP_REACT.useState(null);
    // Folder browser state
    const [showBrowser, setShowBrowser] = SP_REACT.useState(false);
    const [browserMode, setBrowserMode] = SP_REACT.useState("library");
    const [browseData, setBrowseData] = SP_REACT.useState(null);
    const [browsing, setBrowsing] = SP_REACT.useState(false);
    const loadAccounts = async () => {
        try {
            const [v, y, s] = await Promise.all([
                rpcVkGetStatus().catch(() => null),
                rpcYandexGetStatus().catch(() => null),
                rpcSpotifyGetStatus().catch(() => null),
            ]);
            setVkStatus(v);
            setYandexStatus(y);
            setSpotifyStatus(s);
        }
        catch (e) {
            console.error("loadAccounts error:", e);
        }
    };
    const handleAccountLogout = async (service) => {
        setLoggingOutService(service);
        try {
            if (service === "vk")
                await rpcVkLogout();
            else if (service === "yandex")
                await rpcYandexLogout();
            else if (service === "spotify")
                await rpcSpotifyLogout();
            await loadAccounts();
        }
        catch (e) {
            console.error("Account logout error:", e);
        }
        finally {
            setLoggingOutService(null);
        }
    };
    const loadData = async () => {
        try {
            const [fRes, dlRes] = await Promise.all([
                rpcGetLocalFolders(),
                rpcGetDownloadFolder(),
            ]);
            setFolders(fRes || []);
            setDownloadFolder(dlRes || "");
            await loadAccounts();
        }
        catch (e) {
            console.error("Load settings error:", e);
        }
    };
    const navigateBrowser = async (path = "") => {
        setBrowsing(true);
        try {
            const res = await rpcBrowseDirectory(path);
            if (res && res.current) {
                setBrowseData(res);
            }
        }
        catch (e) {
            console.error("Browse error:", e);
        }
        finally {
            setBrowsing(false);
        }
    };
    const openLibraryBrowser = () => {
        setBrowserMode("library");
        setShowBrowser(true);
        navigateBrowser("");
    };
    const openDownloadBrowser = () => {
        setBrowserMode("download");
        setShowBrowser(true);
        navigateBrowser(downloadFolder || "");
    };
    const handleSelectCurrentFolder = async (pathToAdd) => {
        const target = pathToAdd || browseData?.current;
        if (!target)
            return;
        if (browserMode === "library") {
            if (!folders.includes(target)) {
                const updated = [...folders, target];
                setFolders(updated);
                await rpcSetLocalFolders(updated);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        }
        else {
            setDownloadFolder(target);
            await rpcSetDownloadFolder(target);
            // Reload folders because downloadFolder is automatically added to library
            const fRes = await rpcGetLocalFolders();
            setFolders(fRes || []);
            setDlSaved(true);
            setTimeout(() => setDlSaved(false), 2000);
        }
        setShowBrowser(false);
    };
    SP_REACT.useEffect(() => {
        loadData();
    }, []);
    const handleRemoveFolder = async (idx) => {
        const updated = folders.filter((_, i) => i !== idx);
        setFolders(updated);
        await rpcSetLocalFolders(updated);
    };
    const loggedInAccounts = [];
    if (vkStatus && vkStatus.logged_in) {
        loggedInAccounts.push({
            service: "vk",
            name: vkStatus.user_name || "VK User",
            id: vkStatus.user_id ? `ID: ${vkStatus.user_id}` : "",
            label: "VK Музыка",
            avatar: vkStatus.avatar || "",
            color: "#0073f7",
            colorRgb: "0, 115, 247",
            icon: SP_JSX.jsx(VkMusicIcon, { size: 20 }),
        });
    }
    if (yandexStatus && yandexStatus.logged_in) {
        loggedInAccounts.push({
            service: "yandex",
            name: yandexStatus.user_name || "Yandex User",
            id: yandexStatus.user_id ? `ID: ${yandexStatus.user_id}` : "",
            label: "Яндекс Музыка",
            avatar: yandexStatus.avatar || "",
            color: "#facc15",
            colorRgb: "250, 204, 21",
            icon: SP_JSX.jsx(YandexMusicIcon, { size: 20 }),
        });
    }
    if (spotifyStatus && spotifyStatus.logged_in) {
        loggedInAccounts.push({
            service: "spotify",
            name: spotifyStatus.user_name || "Spotify User",
            id: spotifyStatus.product ? `Spotify ${spotifyStatus.product}` : (spotifyStatus.user_id ? `ID: ${spotifyStatus.user_id}` : ""),
            label: "Spotify",
            avatar: spotifyStatus.avatar || "",
            color: "#1ed760",
            colorRgb: "30, 215, 96",
            icon: SP_JSX.jsx(SpotifyIcon, { size: 20 }),
        });
    }
    return (SP_JSX.jsxs("div", { style: { padding: "16px 24px", maxWidth: "800px", margin: "0 auto" }, children: [SP_JSX.jsx("style", { children: `
        .deckymus-account-row {
          transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease, border-color 0.12s ease !important;
          box-sizing: border-box !important;
          outline: none !important;
        }
        .deckymus-account-row .DialogButton,
        .deckymus-account-row button,
        .deckymus-logout-btn {
          width: auto !important;
          min-width: 80px !important;
          max-width: 95px !important;
          flex: 0 0 auto !important;
          height: 36px !important;
          padding: 0 10px !important;
          box-sizing: border-box !important;
        }
        .deckymus-account-row-vk:focus-within,
        .deckymus-account-row-vk:focus,
        .deckymus-account-row-vk:focus-visible,
        .deckymus-account-row-vk.focused,
        .deckymus-account-row-vk[data-focused="true"] {
          outline: 2px solid #0073f7 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(0, 115, 247, 0.85), inset 0 0 4px rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.015) !important;
          filter: brightness(1.2) !important;
          border-color: #0073f7 !important;
        }
        .deckymus-account-row-yandex:focus-within,
        .deckymus-account-row-yandex:focus,
        .deckymus-account-row-yandex:focus-visible,
        .deckymus-account-row-yandex.focused,
        .deckymus-account-row-yandex[data-focused="true"] {
          outline: 2px solid #facc15 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(250, 204, 21, 0.85), inset 0 0 4px rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.015) !important;
          filter: brightness(1.2) !important;
          border-color: #facc15 !important;
        }
        .deckymus-account-row-spotify:focus-within,
        .deckymus-account-row-spotify:focus,
        .deckymus-account-row-spotify:focus-visible,
        .deckymus-account-row-spotify.focused,
        .deckymus-account-row-spotify[data-focused="true"] {
          outline: 2px solid #1ed760 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(30, 215, 96, 0.85), inset 0 0 4px rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.015) !important;
          filter: brightness(1.2) !important;
          border-color: #1ed760 !important;
        }
      ` }), SP_JSX.jsx(DFL.PanelSection, { title: t("languageSettingTitle"), children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { width: "100%", marginBottom: "12px" }, children: SP_JSX.jsx(DFL.DropdownItem, { label: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [SP_JSX.jsx(FaGlobe, { size: 14, color: "#60a5fa" }), SP_JSX.jsx("span", { children: t("languageSettingTitle") })] }), description: t("languageSettingDesc"), menuLabel: t("languageSettingTitle"), rgOptions: SUPPORTED_LANGUAGES.map((l) => ({
                                data: l.code,
                                label: l.code === "auto" ? t("languageAuto") : l.name,
                            })), selectedOption: selectedCode, onChange: (opt) => setLanguage(opt?.data || opt) }) }) }) }), showBrowser && browseData && (SP_JSX.jsx(DFL.PanelSection, { title: browserMode === "download" ? t("modalTitleDownload") : t("modalTitleLibrary"), children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                            width: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.55)",
                            border: "1px solid rgba(59, 130, 246, 0.5)",
                            borderRadius: "10px",
                            padding: "16px",
                            marginBottom: "16px",
                            boxSizing: "border-box",
                        }, children: [SP_JSX.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }, children: [SP_JSX.jsx("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#60a5fa" }, children: browserMode === "download" ? t("modalHeaderDownload") : t("modalHeaderLibrary") }), SP_JSX.jsx(DFL.DialogButton, { onClick: () => setShowBrowser(false), style: { minWidth: 0, padding: "4px 8px", backgroundColor: "transparent" }, children: SP_JSX.jsx(FaTimes, { size: 14, color: "#94a3b8" }) })] }), SP_JSX.jsxs("div", { style: { marginBottom: "12px" }, children: [SP_JSX.jsx("div", { style: { fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }, children: t("quickSelect") }), SP_JSX.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px" }, children: browseData.presets.map((preset, pIdx) => (SP_JSX.jsxs(DFL.DialogButton, { onClick: () => handleSelectCurrentFolder(preset.path), style: { minWidth: "auto", padding: "6px 12px", fontSize: "12px" }, children: [SP_JSX.jsx(FaFolder, { size: 11, style: { marginRight: "6px" } }), preset.name] }, pIdx))) })] }), SP_JSX.jsxs("div", { style: {
                                    padding: "8px 12px",
                                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    color: "#f8fafc",
                                    marginBottom: "10px",
                                    wordBreak: "break-all",
                                }, children: [t("currentFolder"), " ", SP_JSX.jsx("b", { children: browseData.current })] }), SP_JSX.jsxs("div", { style: { display: "flex", gap: "8px", marginBottom: "12px" }, children: [SP_JSX.jsxs(DFL.DialogButton, { onClick: () => handleSelectCurrentFolder(), style: {
                                            flex: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            backgroundColor: "rgba(34, 197, 94, 0.4)",
                                        }, children: [SP_JSX.jsx(FaCheck, { size: 12, color: "#4ade80" }), SP_JSX.jsx("span", { children: t("selectThisFolderBtn") })] }), browseData.parent && (SP_JSX.jsxs(DFL.DialogButton, { disabled: browsing, onClick: () => navigateBrowser(browseData.parent), style: { minWidth: "100px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }, children: [SP_JSX.jsx(FaLevelUpAlt, { size: 12 }), SP_JSX.jsx("span", { children: t("upBtn") })] }))] }), SP_JSX.jsxs("div", { style: {
                                    maxHeight: "180px",
                                    overflowY: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",
                                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                                    paddingTop: "8px",
                                }, children: [browseData.subdirs.length === 0 && (SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#64748b", padding: "8px 0", textAlign: "center" }, children: t("noSubfolders") })), browseData.subdirs.map((sub, sIdx) => (SP_JSX.jsxs(DFL.DialogButton, { onClick: () => navigateBrowser(sub.path), style: {
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-start",
                                            gap: "8px",
                                            padding: "8px 12px",
                                            backgroundColor: "rgba(255, 255, 255, 0.03)",
                                            textAlign: "left",
                                        }, children: [SP_JSX.jsx(FaFolder, { size: 12, color: "#60a5fa" }), SP_JSX.jsx("span", { style: { fontSize: "13px", color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis" }, children: sub.name })] }, sIdx)))] })] }) }) })), SP_JSX.jsx(DFL.PanelSection, { title: t("settingsSectionDownload"), children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { width: "100%", display: "flex", flexDirection: "column", gap: "8px" }, children: [SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#94a3b8" }, children: t("settingsDownloadDesc") }), SP_JSX.jsx("div", { style: { width: "100%", marginBottom: "4px" }, children: SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", onClick: openDownloadBrowser, style: {
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        padding: "12px 0",
                                        backgroundColor: "rgba(59, 130, 246, 0.3)",
                                        border: "1px solid rgba(59, 130, 246, 0.5)",
                                    }, children: [SP_JSX.jsx(FaFolderOpen, { size: 16, color: "#60a5fa" }), SP_JSX.jsx("span", { style: { fontSize: "14px", fontWeight: "bold" }, children: t("selectFolderBtn") })] }) }), SP_JSX.jsxs("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "8px 12px",
                                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                                    borderRadius: "8px",
                                    gap: "10px",
                                }, children: [SP_JSX.jsx(FaDownload, { size: 14, color: "#60a5fa", style: { flexShrink: 0 } }), SP_JSX.jsx("span", { style: {
                                            fontSize: "13px",
                                            color: "#f8fafc",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }, title: downloadFolder, children: downloadFolder || t("settingsNotSelected") })] }), dlSaved && (SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#4ade80", textAlign: "center", marginTop: "2px" }, children: t("downloadFolderUpdated") }))] }) }) }), SP_JSX.jsxs(DFL.PanelSection, { title: t("settingsSectionLibrary"), children: [SP_JSX.jsxs(DFL.PanelSectionRow, { children: [SP_JSX.jsx("div", { style: { width: "100%", marginBottom: "12px" }, children: SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn", onClick: openLibraryBrowser, style: {
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        padding: "12px 0",
                                        backgroundColor: "rgba(59, 130, 246, 0.3)",
                                        border: "1px solid rgba(59, 130, 246, 0.5)",
                                    }, children: [SP_JSX.jsx(FaFolderOpen, { size: 16, color: "#60a5fa" }), SP_JSX.jsx("span", { style: { fontSize: "14px", fontWeight: "bold" }, children: t("selectAndAddFolderBtn") })] }) }), saved && (SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#4ade80", marginBottom: "8px", textAlign: "center" }, children: t("folderAddedSuccess") }))] }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "8px", width: "100%" }, children: [SP_JSX.jsxs("div", { style: { fontSize: "12px", color: "#94a3b8", marginBottom: "2px" }, children: [t("foldersList"), " (", folders.length, "):"] }), folders.length === 0 && (SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#64748b", padding: "8px 0" }, children: t("noAddedFolders") })), folders.map((f, idx) => (SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", style: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "8px 12px",
                                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                                        borderRadius: "8px",
                                        gap: "10px",
                                    }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1, overflow: "hidden" }, children: [SP_JSX.jsx(FaFolder, { size: 14, color: "#60a5fa", style: { flexShrink: 0 } }), SP_JSX.jsx("span", { style: {
                                                        fontSize: "13px",
                                                        color: "#f8fafc",
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                    }, title: f, children: f })] }), SP_JSX.jsx(DFL.DialogButton, { className: "deckymus-focus-btn deckymus-trash-btn", onClick: () => handleRemoveFolder(idx), style: {
                                                minWidth: "36px",
                                                width: "36px",
                                                height: "36px",
                                                padding: 0,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: "rgba(239, 68, 68, 0.2)",
                                                borderRadius: "6px",
                                                flex: "0 0 auto",
                                            }, children: SP_JSX.jsx(FaTrash, { size: 12, color: "#f87171" }) })] }, idx))), SP_JSX.jsx("div", { style: { fontSize: "11px", color: "#64748b", marginTop: "6px" }, children: t("autoScanNotice") })] }) })] }), loggedInAccounts.length > 0 && (SP_JSX.jsx(DFL.PanelSection, { title: t("settingsSectionAccounts") || "Аккаунты", children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "8px", width: "100%" }, children: loggedInAccounts.map((acc) => (SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", className: `deckymus-account-row deckymus-account-row-${acc.service}`, style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 12px",
                                backgroundColor: "rgba(255, 255, 255, 0.04)",
                                border: `1px solid rgba(${acc.colorRgb}, 0.25)`,
                                borderRadius: "8px",
                                gap: "12px",
                                cursor: "default",
                            }, children: [acc.avatar ? (SP_JSX.jsxs("div", { style: { position: "relative", width: "38px", height: "38px", flexShrink: 0 }, children: [SP_JSX.jsx("img", { src: acc.avatar, alt: "", style: { width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover" } }), SP_JSX.jsx("div", { style: {
                                                position: "absolute",
                                                bottom: "-2px",
                                                right: "-2px",
                                                width: "16px",
                                                height: "16px",
                                                borderRadius: "4px",
                                                backgroundColor: "#0f172a",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }, children: acc.icon })] })) : (SP_JSX.jsx("div", { style: {
                                        width: "38px",
                                        height: "38px",
                                        borderRadius: "8px",
                                        backgroundColor: `rgba(${acc.colorRgb}, 0.15)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: acc.color,
                                        flexShrink: 0,
                                    }, children: acc.icon })), SP_JSX.jsxs("div", { style: { flex: "1 1 auto", minWidth: 0, overflow: "hidden" }, children: [SP_JSX.jsx("div", { style: {
                                                fontSize: "14px",
                                                fontWeight: "bold",
                                                color: "#f8fafc",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }, children: acc.name }), SP_JSX.jsxs("div", { style: {
                                                fontSize: "12px",
                                                color: "#94a3b8",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                marginTop: "2px",
                                            }, children: [acc.label, " ", acc.id ? `• ${acc.id}` : ""] })] }), SP_JSX.jsxs(DFL.DialogButton, { className: "deckymus-focus-btn deckymus-logout-btn", onClick: () => handleAccountLogout(acc.service), disabled: loggingOutService === acc.service, style: {
                                        minWidth: "80px",
                                        maxWidth: "95px",
                                        width: "auto",
                                        height: "36px",
                                        padding: "0 10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px",
                                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                                        border: "1px solid rgba(239, 68, 68, 0.4)",
                                        borderRadius: "6px",
                                        flex: "0 0 auto",
                                    }, children: [SP_JSX.jsx(FaSignOutAlt, { size: 13, color: "#f87171" }), SP_JSX.jsx("span", { style: { fontSize: "12px", fontWeight: "bold", color: "#f87171" }, children: loggingOutService === acc.service ? "..." : (t("logoutBtn") || "Выйти") })] })] }, acc.service))) }) }) }))] }));
};

const AboutTab = () => {
    const { t } = useTranslation();
    return (SP_JSX.jsxs("div", { style: { padding: "16px 24px", maxWidth: "800px", margin: "0 auto" }, children: [SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            padding: "18px 20px",
                            backgroundColor: "rgba(0, 0, 0, 0.4)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            width: "100%",
                            boxSizing: "border-box",
                            marginBottom: "12px",
                        }, children: [SP_JSX.jsx("div", { style: {
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "12px",
                                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                                    border: "1px solid rgba(59, 130, 246, 0.4)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }, children: SP_JSX.jsx(DeckyMusIcon, { size: 32 }) }), SP_JSX.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [SP_JSX.jsx("span", { style: { fontSize: "20px", fontWeight: "bold", color: "#f8fafc" }, children: "DeckyMus" }), SP_JSX.jsx("span", { style: {
                                                    fontSize: "11px",
                                                    fontWeight: "bold",
                                                    padding: "2px 8px",
                                                    borderRadius: "6px",
                                                    backgroundColor: "rgba(59, 130, 246, 0.25)",
                                                    color: "#60a5fa",
                                                    border: "1px solid rgba(59, 130, 246, 0.4)",
                                                }, children: "v0.9.2" })] }), SP_JSX.jsx("div", { style: { fontSize: "13px", color: "#94a3b8" }, children: t("aboutTagline") })] })] }) }) }), SP_JSX.jsx(DFL.PanelSection, { title: t("featuresTitle"), children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "10px",
                            width: "100%",
                            marginBottom: "12px",
                        }, children: [SP_JSX.jsxs("div", { style: {
                                    padding: "12px 14px",
                                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(255, 255, 255, 0.06)",
                                }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#60a5fa", fontWeight: 600, fontSize: "13px" }, children: [SP_JSX.jsx(FaHeadphones, { size: 13 }), SP_JSX.jsx("span", { children: t("featBackgroundTitle") })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }, children: t("featBackgroundDesc") })] }), SP_JSX.jsxs("div", { style: {
                                    padding: "12px 14px",
                                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(255, 255, 255, 0.06)",
                                }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#4ade80", fontWeight: 600, fontSize: "13px" }, children: [SP_JSX.jsx(FaFolder, { size: 13 }), SP_JSX.jsx("span", { children: t("featLocalTitle") })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }, children: t("featLocalDesc") })] }), SP_JSX.jsxs("div", { style: {
                                    padding: "12px 14px",
                                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(255, 255, 255, 0.06)",
                                }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#ec5cf7", fontWeight: 600, fontSize: "13px" }, children: [SP_JSX.jsx(VkMusicIcon, { size: 14 }), SP_JSX.jsx("span", { children: t("featVkTitle") })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }, children: t("featVkDesc") })] }), SP_JSX.jsxs("div", { style: {
                                    padding: "12px 14px",
                                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(255, 255, 255, 0.06)",
                                }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#facc15", fontWeight: 600, fontSize: "13px" }, children: [SP_JSX.jsx(YandexMusicIcon, { size: 14 }), SP_JSX.jsx("span", { children: t("featYandexTitle") })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }, children: t("featYandexDesc") })] }), SP_JSX.jsxs("div", { style: {
                                    padding: "12px 14px",
                                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(255, 255, 255, 0.06)",
                                }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#ef4444", fontWeight: 600, fontSize: "13px" }, children: [SP_JSX.jsx(FaYoutube, { size: 14 }), SP_JSX.jsx("span", { children: t("featYtTitle") })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }, children: t("featYtDesc") })] }), SP_JSX.jsxs("div", { style: {
                                    padding: "12px 14px",
                                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(255, 255, 255, 0.06)",
                                }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#a78bfa", fontWeight: 600, fontSize: "13px" }, children: [SP_JSX.jsx(FaDownload, { size: 13 }), SP_JSX.jsx("span", { children: t("featDownloadTitle") })] }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }, children: t("featDownloadDesc") })] })] }) }) }), SP_JSX.jsx(DFL.PanelSection, { title: t("techInfoTitle"), children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                            padding: "14px 16px",
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            borderRadius: "8px",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            width: "100%",
                        }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f8fafc" }, children: [SP_JSX.jsx(FaCheckCircle, { size: 13, color: "#4ade80" }), SP_JSX.jsxs("span", { children: [SP_JSX.jsx("b", { children: t("techAudioEngine") }), " MPV Headless IPC (PipeWire / ALSA)"] })] }), SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f8fafc" }, children: [SP_JSX.jsx(FaCheckCircle, { size: 13, color: "#4ade80" }), SP_JSX.jsxs("span", { children: [SP_JSX.jsx("b", { children: t("techInterface") }), " SteamOS Native React UI (@decky/ui)"] })] }), SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f8fafc" }, children: [SP_JSX.jsx(FaCheckCircle, { size: 13, color: "#4ade80" }), SP_JSX.jsxs("span", { children: [SP_JSX.jsx("b", { children: t("techConversion") }), " FFmpeg & Mutagen ID3"] })] }), SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f8fafc" }, children: [SP_JSX.jsx(FaCheckCircle, { size: 13, color: "#60a5fa" }), SP_JSX.jsx("span", { children: SP_JSX.jsx("b", { children: t("techCreatedFor") }) })] })] }) }) })] }));
};

const FullDeckyMusView = () => {
    const { t } = useTranslation();
    const [status, setStatus] = SP_REACT.useState({
        playback_status: "Stopped",
        position: 0,
        duration: 0,
        volume: 85,
        is_idle: true,
        track: { id: "", title: "", artist: "", album: "", art_url: "", duration: 0, source: "none" },
        queue_length: 0,
        queue_index: -1,
        repeat: "off",
        shuffle: false,
    });
    const pollRef = SP_REACT.useRef(null);
    const fetchStatus = async () => {
        try {
            const res = await rpcGetStatus();
            if (res && typeof res === "object") {
                setStatus(res);
            }
        }
        catch (e) {
            console.error("fetchStatus error:", e);
        }
    };
    SP_REACT.useEffect(() => {
        fetchStatus();
        pollRef.current = setInterval(fetchStatus, 1000);
        return () => {
            if (pollRef.current)
                clearInterval(pollRef.current);
        };
    }, []);
    const pages = [
        {
            title: t("tabPlayer"),
            icon: SP_JSX.jsx(FaPlayCircle, { size: 16 }),
            content: SP_JSX.jsx(NowPlayingTab, { status: status, onRefresh: fetchStatus }),
            route: "/deckymus/now-playing",
        },
        {
            title: t("tabLocal"),
            icon: SP_JSX.jsx(FaFolder, { size: 16 }),
            content: SP_JSX.jsx(LocalLibraryTab, { status: status, onRefresh: fetchStatus }),
            route: "/deckymus/local",
        },
        {
            title: t("tabVk"),
            icon: SP_JSX.jsx(VkMusicIcon, { size: 16 }),
            content: SP_JSX.jsx(VkMusicTab, { status: status, onRefresh: fetchStatus }),
            route: "/deckymus/vk",
        },
        {
            title: t("tabYandex"),
            icon: SP_JSX.jsx(YandexMusicIcon, { size: 16 }),
            content: SP_JSX.jsx(YandexMusicTab, { status: status, onRefresh: fetchStatus }),
            route: "/deckymus/yandex",
        },
        {
            title: t("tabSpotify"),
            icon: SP_JSX.jsx(SpotifyIcon, { size: 16 }),
            content: SP_JSX.jsx(SpotifyTab, { status: status, onRefresh: fetchStatus }),
            route: "/deckymus/spotify",
        },
        {
            title: t("tabYtmusic"),
            icon: SP_JSX.jsx(FaYoutube, { size: 16, color: "#ef4444" }),
            content: SP_JSX.jsx(YouTubeMusicTab, { status: status, onRefresh: fetchStatus }),
            route: "/deckymus/ytmusic",
        },
        {
            title: t("tabSettings"),
            icon: SP_JSX.jsx(FaCog, { size: 16 }),
            content: SP_JSX.jsx(SettingsTab, {}),
            route: "/deckymus/settings",
        },
        {
            title: t("tabAbout"),
            icon: SP_JSX.jsx(FaPuzzlePiece, { size: 16 }),
            content: SP_JSX.jsx(AboutTab, {}),
            route: "/deckymus/about",
        },
    ];
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx("style", { children: `
        .deckymus-track-row {
          transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease, border-color 0.12s ease !important;
          box-sizing: border-box !important;
          outline: none !important;
          margin: 2px 2px !important;
        }
        .deckymus-track-row:focus-within,
        .deckymus-track-row:focus,
        .deckymus-track-row:focus-visible,
        .deckymus-track-row.focused,
        .deckymus-track-row[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 0px !important;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.85), inset 0 0 4px rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.01) !important;
          filter: brightness(1.2) !important;
          border-color: #3b82f6 !important;
          z-index: 2 !important;
        }
        .deckymus-playlist-card {
          transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease, border-color 0.12s ease !important;
          box-sizing: border-box !important;
          outline: none !important;
        }
        .deckymus-playlist-card:focus-within,
        .deckymus-playlist-card:focus,
        .deckymus-playlist-card:focus-visible,
        .deckymus-playlist-card.focused,
        .deckymus-playlist-card[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.85), inset 0 0 4px rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.03) !important;
          filter: brightness(1.2) !important;
          border-color: #3b82f6 !important;
          z-index: 2 !important;
        }
        .deckymus-ctrl-btn {
          transition: transform 0.1s ease, filter 0.1s ease, box-shadow 0.1s ease, outline 0.1s ease !important;
          box-sizing: border-box !important;
        }
        .deckymus-ctrl-btn:focus,
        .deckymus-ctrl-btn:focus-visible,
        .deckymus-ctrl-btn.focused,
        .deckymus-ctrl-btn[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.9), inset 0 0 4px rgba(255, 255, 255, 0.4) !important;
          transform: scale(1.08) !important;
          filter: brightness(1.25) !important;
          z-index: 5 !important;
        }
        .deckymus-focus-btn {
          transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease, border-color 0.12s ease !important;
          box-sizing: border-box !important;
        }
        .deckymus-focus-btn,
        .deckymus-focus-btn *,
        .deckymus-focus-btn:focus,
        .deckymus-focus-btn:focus *,
        .deckymus-focus-btn.focused,
        .deckymus-focus-btn.focused *,
        .deckymus-focus-btn[data-focused="true"],
        .deckymus-focus-btn[data-focused="true"] * {
          color: #ffffff !important;
        }
        .deckymus-focus-btn:focus,
        .deckymus-focus-btn:focus-visible,
        .deckymus-focus-btn.focused,
        .deckymus-focus-btn[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.9), inset 0 0 4px rgba(255, 255, 255, 0.35) !important;
          transform: scale(1.05) !important;
          filter: brightness(1.25) !important;
          border-color: #3b82f6 !important;
          z-index: 5 !important;
        }
        .deckymus-search-input-box {
          border-radius: 8px !important;
          transition: border-color 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease !important;
          box-sizing: border-box !important;
        }
        .deckymus-search-input-box.focused,
        .deckymus-search-input-box[data-focused="true"],
        .deckymus-search-input-box:focus-within {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.9), inset 0 0 6px rgba(59, 130, 246, 0.3) !important;
          border-color: #3b82f6 !important;
        }
        .deckymus-search-input-box.focused input,
        .deckymus-search-input-box[data-focused="true"] input,
        .deckymus-search-input-box:focus-within input {
          border-color: #3b82f6 !important;
          color: #ffffff !important;
        }
        .deckymus-search-input {
          transition: border-color 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease !important;
          box-sizing: border-box !important;
        }
        .deckymus-search-input:focus,
        .deckymus-search-input:focus-visible,
        .deckymus-search-input.focused,
        .deckymus-search-input[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.9), inset 0 0 6px rgba(59, 130, 246, 0.3) !important;
          border-color: #3b82f6 !important;
        }
        .deckymus-trash-btn {
          width: 36px !important;
          min-width: 36px !important;
          max-width: 36px !important;
          height: 36px !important;
          padding: 0 !important;
          flex: 0 0 auto !important;
        }
        .deckymus-trash-btn:focus,
        .deckymus-trash-btn:focus-visible,
        .deckymus-trash-btn.focused,
        .deckymus-trash-btn[data-focused="true"] {
          outline: 2px solid #ef4444 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.95), inset 0 0 4px rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.1) !important;
          filter: brightness(1.3) !important;
          border-color: #ef4444 !important;
          z-index: 5 !important;
        }
        .deckymus-logout-btn {
          width: auto !important;
          min-width: 80px !important;
          max-width: 95px !important;
          flex: 0 0 auto !important;
          height: 36px !important;
        }
        .deckymus-logout-btn:focus,
        .deckymus-logout-btn:focus-visible,
        .deckymus-logout-btn.focused,
        .deckymus-logout-btn[data-focused="true"] {
          outline: 2px solid #ef4444 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.95), inset 0 0 4px rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.05) !important;
          filter: brightness(1.25) !important;
          border-color: #ef4444 !important;
          z-index: 5 !important;
        }
      ` }), SP_JSX.jsx(DFL.SidebarNavigation, { title: "DeckyMus", showTitle: true, pages: pages })] }));
};

const DEFAULT_STATUS = {
    playback_status: "Stopped",
    position: 0,
    duration: 0,
    volume: 85,
    is_idle: true,
    track: { id: "", title: "", artist: "", album: "", art_url: "", duration: 0, source: "none" },
    queue_length: 0,
    queue_index: -1,
    repeat: "off",
    shuffle: false,
};
const Content = () => {
    const [status, setStatus] = SP_REACT.useState(DEFAULT_STATUS);
    const refreshStatus = SP_REACT.useCallback(() => {
        rpcGetStatus()
            .then((s) => {
            if (s)
                setStatus(s);
        })
            .catch((e) => console.error("DeckyMus get_status error:", e));
    }, []);
    SP_REACT.useEffect(() => {
        refreshStatus();
        const interval = setInterval(refreshStatus, 1000);
        return () => clearInterval(interval);
    }, [refreshStatus]);
    return (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(QAMPlayerView, { status: status, onRefresh: refreshStatus }) }));
};
var index = definePlugin(() => {
    // Register native full-screen SteamOS route like Wine Cellar
    routerHook.addRoute("/deckymus", FullDeckyMusView);
    return {
        name: "DeckyMus",
        titleView: (SP_JSX.jsxs("div", { className: DFL.staticClasses.Title, style: { display: "flex", alignItems: "center", gap: "8px" }, children: [SP_JSX.jsx(DeckyMusIcon, { size: 18 }), SP_JSX.jsx("span", { children: "DeckyMus" })] })),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(DeckyMusIcon, { size: 20 }),
        onDismount() {
            routerHook.removeRoute("/deckymus");
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
