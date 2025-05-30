import CreateAccountForm from "@/components/createAccount/createAccount";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: 'Criar Conta',
}

export default function Page() {
  const userCookieInfos = cookies().get('userProfile');
  const userGamesCookieInfos = cookies().get('userGames');

  return (
    <CreateAccountForm userCookieName={userCookieInfos?.name} userCookieVal={userCookieInfos?.value} userGamesCookieVal={userGamesCookieInfos?.name} userGamesCookieName={userGamesCookieInfos?.value} />
  )
}