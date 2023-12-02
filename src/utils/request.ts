import * as v from 'validtyped';
import fetch from 'node-fetch';
import { attempt } from './tryCatch';

export async function get<T>(url: string, validator: v.Validator<T>, headers?: Record<string, string>) {
    const response = await fetch(url, { headers });
    const text = await response.text();
    const data = attempt(text, () => JSON.parse(text));

    const res = validator.validate(data);
    if (res.valid) return res.data;
    throw new Error('Expected response data to match schema: ' + JSON.stringify(res.errors));
}
export async function put(url: string, data: any, headers?: Record<string, string>): Promise<any> {
    const response = await fetch(url, {
        method: 'put',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });

    const text = await response.text();
    return attempt(text, () => JSON.parse(text));
}

export async function post(url: string, data: any, headers?: Record<string, string>): Promise<any>;
export async function post<T>(url: string, data: any, validator: v.Validator<T>, headers?: Record<string, string>): Promise<T>;
export async function post<T>(url: string, data: any, validatorOrHeaders?: v.Validator<T> | Record<string, string>, maybeHeaders?: Record<string, string>) {
    const [validator, headers] = validatorOrHeaders instanceof v.Validator
        ? [ validatorOrHeaders, maybeHeaders ]
        : [ undefined, validatorOrHeaders ];

    const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
    const text = await response.text();
    const responseData = attempt(text, () => JSON.parse(text));

    if (!validator) return responseData;
    if (validator.isValid(responseData)) return responseData;

    throw new Error('Expected responsed data to match schema ' + JSON.stringify(responseData));
}

export function postBuilder<I, O>(url: string, inValidator: v.Validator<I>, outValidator: v.Validator<O>) {
    return (data: I) => {
        if (!inValidator.isValid(data)) throw new Error('Bad post body');

        return post(url, data, outValidator);
    };
}
