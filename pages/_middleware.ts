import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const prepareDevelopmentHost = (hostname, pathname) => {
  //# prepare domain
  //['news', 'detail', 'common'] гэх мэтээр салгана.
  let tempPath = pathname.split("/").filter((el) => el);
  //Эхний элементийг салгаж domain-д өгнө.
  // const domain = tempPath.shift();
  const tempSub = "www";
  const tempDomain = tempPath.shift();
  const tempTld = "mn";

  //# prepare slug
  //үлдсэн үгсийг /-ээр холбож залгана.
  let tempSlug = tempPath.join("/");
  if (tempSlug === "") tempSlug = "home";

  return {
    domain: { subDomain: tempSub, rootDomain: tempDomain, tld: tempTld },
    slug: tempSlug,
  };
};

const prepareProductionHost = (hostname, pathname) => {
  console.log("prepareProductionHost hostname: ", hostname);
  console.log("prepareProductionHost pathname: ", pathname);

  //# prepare domain
  //['www', 'vercel', 'com'] гэх мэтээр салгана.
  let tempHost = hostname.split(".").filter((el) => el);

  const subDomain = tempHost.shift();
  const rootDomain = tempHost.shift();
  const tld = tempHost.shift();

  //# prepare slug
  //['news', 'detail', 'common'] гэх мэтээр салгана.
  let tempPath = pathname.split("/").filter((el) => el);
  //үлдсэн үгсийг /-ээр холбож залгана.
  const tempSlug = tempPath.join("/");

  let hostObject = {
    domain: { subDomain: subDomain, rootDomain: rootDomain, tld: tld },
    slug: tempSlug,
  };

  const localList = ["interactive", "vercel", "localhost", "veritech"];

  if (localList.includes(rootDomain)) {
    hostObject = prepareDevelopmentHost(
      `${hostObject.domain.subDomain}.${hostObject.domain.rootDomain}.${hostObject.domain.tld}`,
      pathname
    );
  }

  return hostObject;
};

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const url = req.nextUrl.clone();

  // const hostname = req.headers.get("host");
  // const pathname = url.pathname;
  const hostname = "hosttest-iota.interactive.app";
  const pathname = "/cozy/news/detail";

  let hostObject = {
    domain: {},
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
        console.log("Хөгжүүлэлийн орчинд ажиллаж байна");
        // hostObject = prepareDevelopmentHost(hostname, pathname);
        hostObject = prepareProductionHost(hostname, pathname);
        break;
      case "production":
        console.log("Production орчинд ажиллаж байна");
        hostObject = prepareProductionHost(hostname, pathname);
        break;
      default:
        break;
    }

    console.log("hostObject: ", hostObject);
  }

  // If localhost, assign the host value manually
  // If prod, get the custom domain/subdomain value by removing the root URL
  // (in the case of "test.vercel.app", "vercel.app" is the root URL)
  const currentHost =
    process.env.NODE_ENV == "production"
      ? hostname.replace(`.${process.env.ROOT_URL}`, "")
      : process.env.CURR_HOST;

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
    // rewrite to the current hostname under the pages/sites folder
    // the main logic component will happen in pages/sites/[site]/index.tsx
    url.pathname = `/_sites/${currentHost}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
}
