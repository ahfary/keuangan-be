import axios, { AxiosInstance } from "axios";


export const axiosClient: AxiosInstance = axios.create({
    baseURL: process.env.LAPUANG_BE || 'lap-uang-vercel.app',
    headers : {"Content-Type": "application/json"}
})