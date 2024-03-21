import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request) {
    // Get image from request
    const body = await request.arrayBuffer();
    const imageBuffer = body;
    // Send image to API

    if (!imageBuffer) return NextResponse.json({data: "Unauthorized"}, {status: 401});

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.API_URL + '/gestures/recognise',
        headers: { 
            'Content-Type': 'image/png',
            'api-key': process.env.API_KEY,
        },
        data: imageBuffer
        };
        
    return axios.request(config)
    .then((response) => {
        console.log("recognise success");
        return NextResponse.json({data: response.data}, {status: 200});    
    })
    .catch((error) => {
        console.log("recognise error");
        console.log(error);
        return NextResponse.json({error: error.response}, {status: 500});
    });

}