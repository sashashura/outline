import { LocationDescriptor } from "history";
import { observer, useObserver } from "mobx-react";
import { CommentIcon } from "outline-icons";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { usePopoverState, PopoverDisclosure } from "reakit/Popover";
import styled from "styled-components";
import Document from "~/models/Document";
import DocumentMeta from "~/components/DocumentMeta";
import DocumentViews from "~/components/DocumentViews";
import Popover from "~/components/Popover";
import useStores from "~/hooks/useStores";

type Props = {
  document: Document;
  isDraft: boolean;
  to?: LocationDescriptor;
  rtl?: boolean;
};

function TitleDocumentMeta({ to, isDraft, document, ...rest }: Props) {
  const { auth, views, comments, ui } = useStores();
  const { t } = useTranslation();
  const { team } = auth;
  const documentViews = useObserver(() => views.inDocument(document.id));
  const totalViewers = documentViews.length;
  const onlyYou = totalViewers === 1 && documentViews[0].user.id;

  React.useEffect(() => {
    if (!document.isDeleted) {
      views.fetchPage({
        documentId: document.id,
      });
    }
  }, [views, document.id, document.isDeleted]);

  const handleClickComments = () => {
    ui.toggleComments();
  };

  const popover = usePopoverState({
    gutter: 8,
    placement: "bottom",
    modal: true,
  });

  const commentsCount = comments.inDocument(document.id).length;

  return (
    <Meta document={document} to={to} {...rest}>
      {totalViewers && !isDraft ? (
        <PopoverDisclosure {...popover}>
          {(props) => (
            <>
              &nbsp;•&nbsp;
              <a {...props}>
                {t("Viewed by")}{" "}
                {onlyYou
                  ? t("only you")
                  : `${totalViewers} ${
                      totalViewers === 1 ? t("person") : t("people")
                    }`}
              </a>
            </>
          )}
        </PopoverDisclosure>
      ) : null}
      <Popover {...popover} width={300} aria-label={t("Viewers")} tabIndex={0}>
        <DocumentViews document={document} isOpen={popover.visible} />
      </Popover>
      {team?.commenting && (
        <>
          &nbsp;•&nbsp;
          <Link onClick={handleClickComments}>
            <CommentIcon color="currentColor" size={18} />
            {commentsCount
              ? t("{{ count }} comment", { count: commentsCount })
              : t("Comment")}
          </Link>
        </>
      )}
    </Meta>
  );
}

const Link = styled.a`
  display: inline-flex;
  align-items: center;
`;

const Meta = styled(DocumentMeta)<{ rtl?: boolean }>`
  justify-content: ${(props) => (props.rtl ? "flex-end" : "flex-start")};
  margin: -12px 0 2em 0;
  font-size: 14px;
  position: relative;
  user-select: none;
  z-index: 1;

  a {
    color: inherit;

    &:hover {
      text-decoration: underline;
    }
  }

  @media print {
    display: none;
  }
`;

export default observer(TitleDocumentMeta);