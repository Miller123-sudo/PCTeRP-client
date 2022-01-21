import axios from "axios";
import constants from "./Constants";
import { TokenService } from "./StorageServices";

const ApiService = {
  init(baseURL) {
    axios.defaults.baseURL = `http://192.168.0.245:2021/api/v1/`;
  },

  setHeader() {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${TokenService.getToken()}`;
    //axios.defaults.headers.common["Authorization"] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwYzMxZTBjNmMyODdkZTUxNDU4NDg1YSIsImlhdCI6MTYyNDAyMjgyMSwiZXhwIjoxNjMxNzk4ODIxfQ.CiLWqw5mEnWxTEwbhWrd1e7NyW075yEu9FvucbILs0w`
  },

  removeHeader() {
    axios.defaults.headers.common = {};
  },

  get(resource) {
    return axios.get(resource);
  },

  post(resource, data) {
    return axios.post(resource, data);
  },

  patch(resource, data) {
    return axios.patch(resource, data);
  },

  delete(resource) {
    return axios.delete(resource);
  },

  /**
   * Perform a custom Axios request.
   *
   * data is an object containing the following properties:
   *  - method
   *  - url
   *  - data ... request payload
   *  - auth (optional)
   *    - username
   *    - password
   **/
  customRequest(data) {
    return axios(data);
  },
};

export default ApiService;
