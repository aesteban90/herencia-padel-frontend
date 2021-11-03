
export default function logout() {
    localStorage.removeItem('tokenHP');
    window.location = '/';
    return ""
}