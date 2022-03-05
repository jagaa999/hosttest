//jagaa start

export const prepareDomainDevelopmentHost = (hostname, pathname) => {
  //# prepare domain
  //['news', 'detail', 'common'] гэх мэтээр салгана.
  let tempPath = pathname.split("/").filter((el) => el);
  //Эхний элементийг салгаж domain-д өгнө.
  // const domain = tempPath.shift();
  const tempSub = "www";
  const tempDomain = tempPath.shift() || "default";
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

export const prepareDomainProductionHost = (hostname, pathname) => {
  console.log("prepareProductionHost hostname: ", hostname);
  console.log("prepareProductionHost pathname: ", pathname);

  //# prepare domain
  //['www', 'vercel', 'com'] гэх мэтээр салгана.
  let tempHost = hostname.split(".").filter((el) => el);

  let subDomain = tempHost.shift();
  let rootDomain = tempHost.shift();
  let tld = tempHost.shift();

  if (subDomain === "localhost:3000") {
    subDomain = "www";
    rootDomain = "localhost";
    tld = "mn";
  }

  //# prepare slug
  //['news', 'detail', 'common'] гэх мэтээр салгана.
  let tempPath = pathname.split("/").filter((el) => el);
  //үлдсэн үгсийг /-ээр холбож залгана.
  const tempSlug = tempPath.join("/");

  let hostObject = {
    domain: { subDomain: "", rootDomain: "", tld: "" },
    slug: "",
  };

  let domainType = "default";

  /*
  local
  localhost:3000/developer
  customer.veritech.mn/developer //dev руу дуудна
  page.veritech.mn/developer //cloud руу дуудна

  sub
  developer.interactive.mn

  default
  www.skyresort.mn
  */

  //check subhost
  const subList = ["interactive", "veritech"];
  if (subList.includes(rootDomain)) {
    domainType = "sub";
  }

  //check localhost
  const localList01 = ["vercel", "localhost"];
  if (localList01.includes(rootDomain)) {
    domainType = "local";
  }
  const localList02 = ["customer.veritech", "page.veritech"];
  if (localList02.includes(`${subDomain}.${rootDomain}`)) {
    domainType = "local";
  }

  switch (domainType) {
    case "default":
      hostObject = {
        domain: { subDomain: subDomain, rootDomain: rootDomain, tld: tld },
        slug: tempSlug,
      };
      break;
    case "local":
      hostObject = prepareDomainDevelopmentHost(
        `${subDomain}.${rootDomain}.${tld}`,
        pathname
      );
      break;
    case "sub":
      hostObject = {
        domain: { subDomain: "www", rootDomain: subDomain, tld: tld },
        slug: tempSlug,
      };
      break;
    default:
      break;
  }

  return hostObject;
};

//jagaa end
