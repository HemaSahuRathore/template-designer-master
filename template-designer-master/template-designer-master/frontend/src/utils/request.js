import Axios from "axios";

const request = async ({
  url, body, method, headers = {}, onSuccess, onError }) => {
  let data, response,
    errors = [];
  try {
    const requestUrl = process.env.VUE_APP_SERVER + url;
    response = await Axios[method](requestUrl, body, headers);
    if (response) data = response.data;
    if (onSuccess) onSuccess(data);
  } catch (error) {
    errors = error.response.data.errors;
    if (onError) onError(errors);
  }
  return { data, errors };
};

export default request;
