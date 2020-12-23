const URL_ROUTE = "https://www.michelin-ads.com"

const ID_LUM_APPLICATION = "Q0FMT1A="
const BASIC_TOKEN = "cHZ0eVZpbWZGcVU0TkhGdmNGOU5pZz09QEBIZVByZ01xL0tTV0ltVm4vdDB0YS9uRzVScWV0alY4R295VEdsVksvSC9JPQ=="
const DS_PASSWORD = "U2tWdE5tTk5iams9"


var encriptedTokenAuthorization, encriptedIdMachine, email, password = ""
const LOCATION = window.location.origin
var SWFIsReady = false
var tries = 0
var encriptedTokenAuthorization, encriptedIdMachine, email, password = ""

const appName = "CPK_ADMIN";

$(document).ready(function () {

    $('#loginPopUp').modal('hide');
	
    // access('CHECK');
	
});

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

// clear lum user
function lumLogoff() {
	
    if (encriptedTokenAuthorization) {

			var xd_cookie = xDomainCookie( 'https://www.michelin-ads.com' );
			encriptedIdMachine = btoa(uuidv4());

			xd_cookie.get( 'lum_uom', function(cookie_val){
				//cookie val will contain value of cookie as fetched from local val (if present) else from iframe (if set), else null
				if(!cookie_val){
					xd_cookie.set( 'lum_uom', encriptedIdMachine);
				} else {
					encriptedIdMachine = cookie_val;
				}
				
			var formData = new FormData();

            formData.append('idMachine', encriptedIdMachine);
            formData.append('tokenAuthorization', encriptedTokenAuthorization);

            $.ajax({
                url: URL_ROUTE + "/com/public/lum/auth/clear",
                type: 'POST',
                processData: false,
                contentType: false,
                data: formData,
                dataType: 'json',
                success: function (data2, textStatus, jqXHR) {

                    if (data2 && data2.STATUS && data2.STATUS == "OK") {
                        console.info("DATA CLEANED");
                    } else {
                        console.error("session not cleared: ", data2.MESSAGE);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(jqXHR);
                }
            });
				
			});

    } else {
        access('LOGOUT');
    }
}

// quando a comunicação com o flex está pronta
function setSWFIsReady(email, password) {
    console.log("Set Ready");
    SWFIsReady = true;
    this.email = email.toLocaleLowerCase()
    this.password = password
    openLoginLum();
}

// Internet Explorer and Mozilla-based browsers refer to the Flash application 
// object differently.
// This function returns the appropriate reference, depending on the browser.
function getFlexApp(appName) {
    if (navigator.appName.indexOf("Microsoft") != -1) {
        return window[appName];
    } else {
        return document[appName];
    }
}

function access(goTo) {

    var formData = new FormData();

    formData.append('idLumApplication', ID_LUM_APPLICATION);
    formData.append('basicToken', BASIC_TOKEN);
    formData.append('dsPassword', DS_PASSWORD);

    $.ajax({
        url: URL_ROUTE + "/com/public/lum/auth/access",
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function (data, textStatus, jqXHR) {

            if (data && data.STATUS == "OK" && data.tokenAuthorization) {
                encriptedTokenAuthorization = btoa(data.tokenAuthorization)

                switch (goTo) {
                    case 'CHECK':
                        check();
                        break;
                    case 'LOGIN':
                        loginLum();
                        break;
                    case 'LOGOUT':
                        lumLogoff();
                        break;
                }
            } else {
                console.log("Chamando login flex 1");
                callLoginFlex();
                console.error("Erro ao solicitar acesso ao login LUM", "Erro");
                console.error("data ", data.MESSAGE);
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {

            console.error(jqXHR);
            if (jqXHR.status === 401) {
                console.error("Ocorreu um erro nesta ação", "Erro");
            } else {
                console.error("Ocorreu um erro nesta ação", "Erro");
            }
            console.log("Chamando login flex 2");
            callLoginFlex();
        }
    });

}

function check() {

    // if has authorization to use LUM API
    if (encriptedTokenAuthorization) {
			
			var xd_cookie = xDomainCookie( 'https://www.michelin-ads.com' );
			encriptedIdMachine = btoa(uuidv4());

			xd_cookie.get( 'lum_uom', function(cookie_val){
				//cookie val will contain value of cookie as fetched from local val (if present) else from iframe (if set), else null
				if(!cookie_val){
					xd_cookie.set( 'lum_uom', encriptedIdMachine);
				} else {
					encriptedIdMachine = cookie_val;
				}
				
				var formData = new FormData();

				formData.append('idMachine', encriptedIdMachine);
				formData.append('tokenAuthorization', encriptedTokenAuthorization);
				formData.append('basicToken', BASIC_TOKEN);

				if (encriptedIdMachine && encriptedTokenAuthorization && BASIC_TOKEN) {

					$.ajax({
						url: URL_ROUTE + "/com/public/lum/auth/check",
						type: 'POST',
						data: formData,
						processData: false,
						contentType: false,
						dataType: 'json',
						success: function (data, textStatus, jqXHR) {

							// Se estiver com cookie válido
							if (data && data.STATUS == "OK" && data.BASIC_TOKEN && data.LUM_USER && data.LUM_USER.dsEmail) {

								// chamada para logar no portal
								if (SWFIsReady) {
									getFlexApp(appName).loginLum(data.LUM_USER.dsEmail);
								}

                            } else { // if has no logged user
                                console.log("Chamando login flex 3");
								callLoginFlex();
							}

						},
						error: function (jqXHR, textStatus, errorThrown) {

							console.error(jqXHR);
							if (jqXHR.status === 401) {
								console.error("Ocorreu um erro nesta ação", "Erro");
							} else {
								console.error("Ocorreu um erro nesta ação", "Erro");
                            }
                            console.log("Chamando login flex 4");
							callLoginFlex();
						}
					});
				} else {
                    console.log("Chamando login flex 5");
					callLoginFlex();
				};
			});
    } else {
        console.log("Chamando login flex 6");
        callLoginFlex();
    }

}

// chamada do flex para o javascript
function openLoginLum() {

    // if has authorization to use LUM API
    if (encriptedTokenAuthorization) {
        loginLum(email, password)
        // callLoginFlex();
    } else {

        if (email && email.length > 0 && password && password.length > 0) {
            // get authorization
            access('LOGIN')
        } else {
            access('CHECK');
        }

    }

}

function loginLum() {

    if (encriptedTokenAuthorization) {

        if (email && email.length > 0 && password && password.length > 0) {

            var formData = new FormData();
            formData.append('tokenAuthorization', encriptedTokenAuthorization);
            formData.append('basicToken', BASIC_TOKEN);
            formData.append('dsEmail', btoa(email));
            formData.append('dsPassword', btoa(password));
            formData.append('idMachine', encriptedIdMachine);

            formData.append('urlSuccess', "https://www1.michelin-ads.com/2r");
            formData.append('urlFail', LOCATION);

            $.ajax({
                url: URL_ROUTE + "/com/public/lum/auth/access/login",
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function (data, textStatus, jqXHR) {

                    if (data) {
                        // do Login
                        if (data.STATUS == "OK") {
                            setSWFIsReady("", "")
                        } else if (data.STATUS == "INVALID_LOGIN" || data.STATUS == "INVALID_PARAMS") {
                            console.warn("Login Inválido")
                            console.log("Chamando login flex 7");
                            callLoginFlex();
                        } else if (data.STATUS == "INVALID_TOKEN") {
                            if (tries < 1) {
                                access('LOGIN')
                                tries++
                            } else {
                                console.log("Chamando login flex 8");
                                callLoginFlex();
                            }
                            console.error("Token de verificação inválido")
                        } else if (data.STATUS == "ERROR") {
                            console.log("Chamando login flex 9");
                            callLoginFlex();
                            console.error("Ocorreu um erro nesta ação")
                        } else {
                            console.log("Chamando login flex 10");
                            callLoginFlex();
                            console.warn("Sessão expirada")
                            access('LOGIN')
                        }
                    } else {
                        console.log("Chamando login flex 11");
                        callLoginFlex();
                    }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(jqXHR);
                    console.log("Chamando login flex 12");
                    callLoginFlex()
                }
            });

        } else {
            access('CHECK')
        }

    } else {
        // get authorization
        access('LOGIN')

    }

}

function callLoginFlex() {

    if (email && email.length > 0 && password && password.length > 0) {
        if (SWFIsReady) {
            getFlexApp(appName).loginFlex();
        }
    } else {
        console.warn("Email and Password not pass")
    }
}