import axios from 'axios'

const http = {}
http.post = function(){
	var url = '';//请求地址
	var params = {};//请求参数
	var headers = {};//请求头
	var timeOut = 5000;//请求超时
	for(var i=0,len=arguments.length;i<len;i++){
		if(typeof(arguments[i]) == 'string'&&arguments[i].indexOf('/')!=-1){
			//请求时地址
			url = arguments[i];
		}
		if(i==1&&typeof(arguments[i]) == 'object'){
			//参数
			params = arguments[i];
		}
		if(i==2&&typeof(arguments[i]) == 'object'){
			//参数
			headers = arguments[i];
		}
		if(typeof(arguments[i]) == 'number'){
			//超时
			timeOut = arguments[i];
		}
	}
	if(url == ''){
		console.log('请传入接口地址');
		return;
	}
	params = jsonToFrom(params);
	return new Promise((resolve,reject) => {
		axios.post(url,params,{
			headers:headers,
			timeout:timeOut
		}).then(response => {
			resolve(response.data);
			if(response.data.code == '401'){
				
			}
		}).catch(err => {
			reject(err);
		})
	})
}
http.get = function(){
	var url = '';//请求地址
	var params = {};//请求参数
	var headers = {};//请求头
	var timeOut = '';//请求超时
	for(var i=0,len=arguments.length;i<len;i++){
		if(typeof(arguments[i]) == 'string'&&arguments[i].indexOf('/')!=-1){
			//请求时地址
			url = arguments[i];
		}
		if(i==1&&typeof(arguments[i]) == 'object'){
			//参数
			params = arguments[i];
		}
		if(i==2&&typeof(arguments[i]) == 'object'){
			//参数
			headers = arguments[i];
		}
		if(typeof(arguments[i]) == 'number'){
			//超时
			timeOut = arguments[i];
		}
	}
	if(url == ''){
		console.log('请传入接口地址');
		return;
	}
	var api = url;
	return new Promise((resolve,reject) => {
		axios.get(api,{
			params: params,
			headers:headers
		}).then(response => {
			resolve(response.data);
		}).catch(err => {
			reject(err);
		})
	})
}

function jsonToFrom(data) {
	let res = new FormData();
	for (let i in data)
		res.append(i, data[i]);
	return res;
}
export default http;
