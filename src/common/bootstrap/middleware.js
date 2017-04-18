/**
 * this file will be loaded before server started
 * you can register middleware
 * https://thinkjs.org/doc/middleware.html
 */

/**
 *
 * think.middleware('xxx', http => {
 *
 * })
 *
 */

think.middleware('auth', function*(http) {
    const reqUrl = http.url;

    console.log('auth middleware run', reqUrl);
    let value = yield http.session("user");
    //过滤掉'home/user'
    let path = http.url.replace(http.host, '');
    path = path.split('?')[0];

    if (reqUrl.indexOf('install') != -1 || reqUrl.indexOf('auth') != -1 || path == '/home/user' || value) {
        console.log('auth pass');
    } else {
        console.log('auth fail');
        return http.redirect("/auth");
        http.prevent();
    }
})
