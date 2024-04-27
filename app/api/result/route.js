import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request) {

    const searchParams = request.nextUrl.searchParams
    const playerMove = searchParams.get('playerMove').trim(); 
    const npcMove = searchParams.get('npcMove').trim();

    let config = {
        method: 'get',
        url: process.env.API_URL + `/moves/result/${npcMove}/${playerMove}`, // API wants npc move first
        headers: { 
            'api-key': process.env.API_KEY,
        },
        };

    console.log(config.url); 

    return axios.request(config)
    .then((response) => {
        //console.log("success");
        //console.log(response.data.result);
        return NextResponse.json({data: response.data.result}, {status: 200});     
    })
    .catch((error) => {
        console.log("error");
        console.log(error.response.status);
        console.log(error.response.statusText);
        return NextResponse.json({data: error.response.data}, {status: 500});     
    });

}