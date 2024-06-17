import axios from 'axios';
import { get } from 'lodash-es';

export const getInsured = async (code) => {
  try {
    const response = await axios.get(`/api/policyholders?code=${code}`);
    const result = get(response, 'data.result', null);
    return result;
  } catch (error) {
    return error
  }
}

export const getParentInsured = async (code) => {
  try {
    const response = await axios.get(`/api/policyholders/${code}/top`);
    const result = get(response, 'data.result', null);
    return result;
  } catch (error) {
    return error
  }
}
