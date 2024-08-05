import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";
interface LinkifyProps {
  children: React.ReactNode;
}
import React from "react";
import UserLinkWithTooltip from "@/components/UserLinkWithTooltip";

const Linkify = ({ children }: LinkifyProps) => {
  return (
    <LinkifyUsername>
      <LinkifyHashTag>
        <LinkifyUrl>{children}</LinkifyUrl>
      </LinkifyHashTag>
    </LinkifyUsername>
  );
};

// định dạng cho url của content bài viết
function LinkifyUrl({ children }: LinkifyProps) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
}
//định dạng tên @manh
function LinkifyUsername({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => {
        return (
          <UserLinkWithTooltip key={key} username={match.slice(1)}>
            {match}
          </UserLinkWithTooltip>
        );
      }}
    >
      {children}
    </LinkIt>
  );
}
//định dạng hashtag #manh11
function LinkifyHashTag({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9]+)/}
      component={(match, key) => (
        <Link
          key={key}
          href={`/hashtag/${match.slice(1)}`}
          className="text-primary hover:underline"
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
}
export default Linkify;
