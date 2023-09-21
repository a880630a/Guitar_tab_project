import _axios from "axios"

const axios = (baseURL) => {
    const instance = _axios.create({
				//建立一個自定義的axios
        baseURL: baseURL || 'http://0.0.0.0:8877', //Flask所開的端口位置
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-methods':'GET,POST',
            'Access-Control-Allow-Private-Network': true
        },
        timeout: 20000,
    });
    return instance
}

export {axios};
export default axios();