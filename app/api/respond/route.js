import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request) {

    const searchParams = request.nextUrl.searchParams
    const moveID = searchParams.get('moveID')

    console.log("MoveID: " + moveID);

    let config = {
        method: 'get',
        url: process.env.API_URL + `/moves/respond?moveID=${moveID}`,
        headers: { 
            'api-key': process.env.API_KEY,
        },
        };
        
    return axios.request(config)
    .then((response) => {
        console.log("success");
        console.log(response.data.move);
        return NextResponse.json({data: response.data.move}, {status: 200});     
    })
    .catch((error) => {
        console.log("error");
        console.log(error);
        return NextResponse.json({data: error.response.data}, {status: 200});     
    });

}