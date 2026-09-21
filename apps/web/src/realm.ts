export function currentRealm(){return new URLSearchParams(location.search).get("realm")??localStorage.getItem("masterhost.realm")??"default"}
export function realmHeaders(input?:HeadersInit){const headers=new Headers(input),realm=currentRealm(),token=sessionStorage.getItem(`masterhost.realmAccess.${realm}`)??sessionStorage.getItem(`masterhost.realmAdmin.${realm}`);headers.set("x-realm-slug",realm);if(token&&!headers.has("authorization"))headers.set("authorization",`Bearer ${token}`);return headers}
export function rememberRealm(slug:string){localStorage.setItem("masterhost.realm",slug)}
