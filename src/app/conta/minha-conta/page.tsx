import MyAccountPage from "@/components/myAccount/myAccount";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: 'Minha Conta',
}

export default function Page() {
  const userCookieInfos = cookies().get('userProfile');
  const userGamesCookieInfos = cookies().get('userGames');

  return (
    <MyAccountPage userGamesCookieName={userGamesCookieInfos?.name} userGamesCookieVal={userGamesCookieInfos?.value} userCookieName={userCookieInfos?.name} userCookieVal={userCookieInfos?.value} />
  )
}