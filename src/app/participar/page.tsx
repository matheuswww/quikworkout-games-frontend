import Participate from "@/components/participate/participate";
import { cookies } from "next/headers";

export default function Page() {
    const userCookieInfos = cookies().get('userProfile');
    const userGamesCookieInfos = cookies().get('userGames');

  return (
    <Participate userGamesCookieName={userGamesCookieInfos?.name} userGamesCookieVal={userGamesCookieInfos?.value} userCookieName={userCookieInfos?.name} userCookieVal={userCookieInfos?.value} ticketLink={process.env.NEXT_TICKET_LINK} />
  )
}