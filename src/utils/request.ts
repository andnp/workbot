import * as v from 'validtyped';
import fetch from 'node-fetch';
import { attempt } from './tryCatch';

export async function get<T>(url: string, validator: v.Validator<T>) {
    const response = await fetch(url);
    const data = await response.json();

    if (validator.isValid(data)) return data;
    throw new Error('Expected response data to match schema');
}

export async function post(url: string, data: any): Promise<any>;
export async function post<T>(url: string, data: any, validator: v.Validator<T>): Promise<T>;
export async function post<T>(url: string, data: any, validator?: v.Validator<T>) {
    const response = await fetch(url, { method: 'post', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json'} });
    const text = await response.text();
    const responseData = attempt(text, () => JSON.parse(text));

    if (!validator) return responseData;
    if (validator.isValid(responseData)) return responseData;

    throw new Error('Expected responsed data to match schema');
}

export function postBuilder<I, O>(url: string, inValidator: v.Validator<I>, outValidator: v.Validator<O>) {
    return (data: I) => {
        if (!inValidator.isValid(data)) throw new Error('Bad post body');

        return post(url, data, outValidator);
    };
}
