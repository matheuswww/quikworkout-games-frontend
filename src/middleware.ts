import { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
 const url = new URL(request.url);
 
}

export const config = {
 matcher: [

 ],
};
