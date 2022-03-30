import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import {
  prepareHostObject,
  prepareDomainDevelopmentHost,
  prepareDomainProductionHost,
} from "../util/middlewareHelper";

// https://github.com/vercel/examples/blob/main/edge-functions/hostname-rewrites/pages/_middleware.ts

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const url = req.nextUrl.clone();

  const hostname = req.headers.get("host");
  const pathname = url.pathname;
  // const hostname = "localhost:3000";
  // const pathname = "/cozy/news/detail";
  // console.log("middleware -hostname ", hostname, "  -pathname ", pathname);

  const hostObject = prepareHostObject(url, hostname, pathname);

  // console.log("ddd", hostObject);

  console.log("middleware hostObject ready: ", hostObject);

  // Prevent security issues – users should not be able to canonically access
  // the pages/sites folder and its respective contents. This can also be done
  // via rewrites to a custom 404 page
  if (url.pathname.startsWith(`/_sites`)) {
    return new Response(null, { status: 404 });
  }

  if (
    !url.pathname.includes(".") && // exclude all files in the public folder
    !url.pathname.startsWith("/api") && // exclude all API routes
    !url.pathname.startsWith("/callback") && // exclude all callback
    !url.pathname.startsWith("/check") && // exclude all callback
    !url.pathname.startsWith("/login") && // exclude all login
    !url.pathname.startsWith("/page") // page-ийг бас орхих хэрэгтэй.
  ) {
    /*
    V1.0
    url.pathname = `/_sites/${hostObject.domain.rootDomain}/${
      hostObject.slug
    }?hostObject=${encodeURIComponent(JSON.stringify(hostObject))}`;
    */

    //V2.0
    url.pathname = `/_sites/${hostObject.domain.rootDomain}/${hostObject.slug}`;

    // NextResponse.next().cookie("theme", "hahahahaha");
    //cookie бичдэг хэсэг. ! энийг getServerSideProps дээр авахын тулд заавал refresh хийх ёстой болоод байна!! Иймээс болилоо. hostObject-ийг шууд url.pathname дотор өгч явуулав.
    /*
    const res = NextResponse.rewrite(url);
    res.cookie("hostObject", JSON.stringify(hostObject));
    return res;
    */
    return NextResponse.rewrite(url);
  }
}
