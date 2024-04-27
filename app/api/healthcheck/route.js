import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request) {

    let config = {
        method: 'get',
        url: process.env.API_URL + `/moves/`,
        headers: { 
            'api-key': process.env.API_KEY,
        },
        };
        
    return axios.request(config)
    .then((response) => {
        console.log("success");
        return NextResponse.json({status: 200});     
    })
    .catch((error) => {
        console.log("error");
        return NextResponse.json({status: 500});     
    });

}