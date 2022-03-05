import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import {
  prepareDomainDevelopmentHost,
  prepareDomainProductionHost,
} from "../util/helper";

// https://github.com/vercel/examples/blob/main/edge-functions/hostname-rewrites/pages/_middleware.ts

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const url = req.nextUrl.clone();

  const hostname = req.headers.get("host");
  const pathname = url.pathname;
  // const hostname = "localhost:3000";
  // const pathname = "/cozy/news/detail";

  let hostObject = {
    domain: { subDomain: "", rootDomain: "", tld: "" },
    slug: "",
  };

  if (
    !url.pathname.includes(".") && // exclude files public folder
    !url.pathname.startsWith("/api") // exclude API routes
  ) {
    console.log("\n\n---------------------- \n");
    console.log("hostname: ", hostname);
    console.log("pathname: ", pathname);

    switch (process.env.NODE_ENV) {
      case "development":
        console.log("Хөгжүүлэлтийн орчинд ажиллаж байна");
        hostObject = prepareDomainDevelopmentHost(hostname, pathname);
        // hostObject = prepareProductionHost(hostname, pathname);
        break;
      case "production":
        console.log("Production орчинд ажиллаж байна");
        hostObject = prepareDomainProductionHost(hostname, pathname);
        break;
      default:
        break;
    }

    console.log("hostObject: ", hostObject);
  }

  // Prevent security issues – users should not be able to canonically access
  // the pages/sites folder and its respective contents. This can also be done
  // via rewrites to a custom 404 page
  if (url.pathname.startsWith(`/_sites`)) {
    return new Response(null, { status: 404 });
  }

  if (
    !url.pathname.includes(".") && // exclude all files in the public folder
    !url.pathname.startsWith("/api") // exclude all API routes
  ) {
    console.log("Ийшээ орсон уу");
    // rewrite to the current hostname under the pages/sites folder
    // the main logic component will happen in pages/sites/[site]/index.tsx
    // url.pathname = `/_sites/${pathname}`;
    url.pathname = `/_sites/${hostObject.domain.rootDomain}/${hostObject.slug}`;
    console.log("url.pathname", url.pathname);
    // return NextResponse.rewrite(url);
    // const ddd = `/_sites/${pathname}`;
    // console.log("BBBBBBB ddd", ddd);
    return NextResponse.rewrite(url);
  }
}
