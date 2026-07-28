"use client";
import {
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Spinner,
  Switch,
} from "@nextui-org/react";
import axios from "axios";
import { User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { PiTriangleThin } from "react-icons/pi";

interface TikTokComplianceProps {
  user: User | null;
  onChange: (data: any) => void;
  onMaxVideoDurationChange: (duration: number) => void;
  t: {
    videoVisibility: string;
    allowOnVideo: string;
    discloseContent: string;
    discloseContentDescription: string;
    yourBrand: string;
    yourBrandDescription: string;
    brandedContent: string;
    brandedContentDescription: string;
    brandedContentPopover: string;
    agreeToPolicy: string;
    brandedContentPolicy: string;
    musicUsagePolicy: string;
  };
}

const TikTokCompliance: React.FC<TikTokComplianceProps> = ({
  user,
  onChange,
  onMaxVideoDurationChange,
  t,
}) => {
  const [discloseVideoContent, setDiscloseVideoContent] = useState(false);
  const [visibility, setVisibility] = useState("");
  const [isYourBrandChecked, setIsYourBrandChecked] = useState(false);
  const [isBrandedContentChecked, setIsBrandedContentChecked] = useState(false);

  const [isCommentCheckboxDisabled, setIsCommentCheckboxDisabled] =
    useState(true);
  const [isDuetCheckboxDisabled, setIsDuetCheckboxDisabled] = useState(true);
  const [isStitchCheckboxDisabled, setIsStitchCheckboxDisabled] =
    useState(true);
  const [privacyLevelOptions, setPrivacyLevelOptions] = useState<string[]>([]);
  const [maxVideoPostDurationSec, setMaxVideoPostDurationSec] = useState(0);

  const [isCommentAllowed, setIsCommentAllowed] = useState(false);
  const [isDuetAllowed, setIsDuetAllowed] = useState(false);
  const [isStitchAllowed, setIsStitchAllowed] = useState(false);

  const [tiktokErrorCode, setTiktokErrorCode] = useState("ok");

  const [loading, setLoading] = useState(true);

  const setCookie = async () => {
    try {
      await fetch("/api/setCookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });
    } catch (error) {
      console.error("Error setting cookies: ", error);
      throw error;
    }
  };

  const makeCloudFunctionRequest = async () => {
    try {
      await setCookie();

      if (user) {
        const token = await user.getIdToken();
        const response = await axios.post("/api/get-creator-info-tiktok", {
          token,
        });

        const creatorInfo = response.data.creator_info;
        const errorInfo = response.data.creator_info.error;

        const errorCode = errorInfo?.code;
        setTiktokErrorCode(errorCode);

        setIsCommentCheckboxDisabled(creatorInfo.data.comment_disabled);
        setIsDuetCheckboxDisabled(creatorInfo.data.duet_disabled);
        setIsStitchCheckboxDisabled(creatorInfo.data.stitch_disabled);
        setPrivacyLevelOptions(creatorInfo.data.privacy_level_options);
        setMaxVideoPostDurationSec(
          creatorInfo.data.max_video_post_duration_sec
        );

        if (errorCode !== "ok") {
          console.error(`Error code received: ${errorCode}`);
        }

        setLoading(false);
      } else {
        console.error("User is not authenticated.");
      }
    } catch (error) {
      console.error("Error making cloud function request: ", error);
    }
  };

  useEffect(() => {
    if (user) {
      makeCloudFunctionRequest();
    }
  }, [user]);

  useEffect(() => {
    const isPrivacyLevelSelected = visibility !== "";
    const isDisclosureValid =
      !discloseVideoContent ||
      (discloseVideoContent && (isYourBrandChecked || isBrandedContentChecked));

    const isFormComplete = isPrivacyLevelSelected && isDisclosureValid;

    onChange({
      privacyLevelOption: visibility,
      commentDisabled: !isCommentAllowed,
      duetDisabled: !isDuetAllowed,
      stitchDisabled: !isStitchAllowed,
      discloseVideoContent,
      isYourBrandChecked,
      isBrandedContentChecked,
      isFormComplete,
      missingFields: {
        privacyLevel: !isPrivacyLevelSelected,
        disclosure: discloseVideoContent && !isDisclosureValid,
      },
    });
  }, [
    visibility,
    isCommentAllowed,
    isDuetAllowed,
    isStitchAllowed,
    discloseVideoContent,
    isYourBrandChecked,
    isBrandedContentChecked,
  ]);

  useEffect(() => {
    onMaxVideoDurationChange(maxVideoPostDurationSec);
  }, [maxVideoPostDurationSec]);

  const handleVisibilityChange = (value: string) => {
    setVisibility(value);
    if (value === "SELF_ONLY") {
      setIsBrandedContentChecked(false);
    }
  };

  const handleBrandedContentClick = (e: React.MouseEvent) => {
    if (visibility === "SELF_ONLY") {
      e.preventDefault();
    }
  };

  if (loading) {
    return (
      <div className="relative flex justify-center items-center mt-5 w-full border-1 border-borderColor rounded-lg">
        <div className="absolute top-0 right-0 -translate-y-full mt-[4px] mr-16">
          <PiTriangleThin size={28} color={"#C6C6C9"} />
        </div>
        <Spinner size="lg" className="py-10" />
      </div>
    );
  }

  if (!loading && tiktokErrorCode !== "ok") {
    return (
      <div className="flex justify-center items-center mt-5 w-full border-1 border-borderColor rounded-lg py-10">
        <p>
          {tiktokErrorCode === "spam_risk_too_many_posts"
            ? "The daily post cap is reached for the user."
            : tiktokErrorCode}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-5 w-full border-1 border-borderColor gap-5 p-4 rounded-lg">
        <div className="absolute top-0 right-0 -translate-y-full mt-[4px] mr-4 md:mr-16">
          <PiTriangleThin size={28} color={"#C6C6C9"} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 xl:md:grid-cols-1 2xl:grid-cols-2">
          <div>
            <div className="pr-0 md:pr-5 lg:pr-0">
              <p className="font-bold mb-1">{t.videoVisibility}</p>
              <Select
                className="w-full md:max-w-xs"
                label="Select one"
                variant="bordered"
                selectedKeys={visibility ? [visibility] : []}
                onChange={(e) => handleVisibilityChange(e.target.value)}
              >
                {privacyLevelOptions?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "PUBLIC_TO_EVERYONE"
                      ? "Public to everyone"
                      : option === "MUTUAL_FOLLOW_FRIENDS"
                      ? "Mutual follow friends"
                      : option === "SELF_ONLY"
                      ? "Self only"
                      : option === "FOLLOWER_OF_CREATOR"
                      ? "Follower of creator"
                      : option}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="mt-7">
              <p className="font-bold mb-1">{t.allowOnVideo}</p>
              <div className="flex flex-col sm:flex-row">
                <Checkbox
                  isSelected={isCommentAllowed}
                  onChange={() => setIsCommentAllowed(!isCommentAllowed)}
                  className="mr-3 mb-1 sm:mb-0"
                  isDisabled={isCommentCheckboxDisabled}
                >
                  Comment
                </Checkbox>

                <Checkbox
                  isSelected={isDuetAllowed}
                  onChange={() => setIsDuetAllowed(!isDuetAllowed)}
                  className="mr-3 mb-1 sm:mb-0"
                  isDisabled={isDuetCheckboxDisabled}
                >
                  Duet
                </Checkbox>

                <Checkbox
                  isSelected={isStitchAllowed}
                  onChange={() => setIsStitchAllowed(!isStitchAllowed)}
                  isDisabled={isStitchCheckboxDisabled}
                  className="sm:mb-0"
                >
                  Stitch
                </Checkbox>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-5">
              <div className="flex flex-row md:flex-row justify-between">
                <p className="font-bold mb-1">{t.discloseContent}</p>
                <Switch
                  defaultSelected={false}
                  size="sm"
                  onChange={(e) => setDiscloseVideoContent(e.target.checked)}
                />
              </div>
              <p className="text-sm">{t.discloseContentDescription}</p>
            </div>

            {discloseVideoContent && (
              <>
                <div className="flex flex-row md:flex-row justify-between">
                  <p className="font-bold mb-1">{t.yourBrand}</p>
                  <Checkbox
                    isSelected={isYourBrandChecked}
                    onChange={() => setIsYourBrandChecked(!isYourBrandChecked)}
                  />
                </div>
                <p className="text-sm">{t.yourBrandDescription}</p>
                <div className="mt-4">
                  <div className="flex flex-row md:flex-row justify-between">
                    <p className="font-bold mb-1">{t.brandedContent}</p>
                    <Popover placement="top">
                      <PopoverTrigger>
                        <div>
                          <Checkbox
                            isSelected={isBrandedContentChecked}
                            onClick={handleBrandedContentClick}
                            isDisabled={visibility === "SELF_ONLY"}
                            onChange={(e) =>
                              setIsBrandedContentChecked(e.target.checked)
                            }
                          />
                        </div>
                      </PopoverTrigger>
                      {visibility === "SELF_ONLY" && (
                        <PopoverContent>
                          <p className="p-2">{t.brandedContentPopover}</p>
                        </PopoverContent>
                      )}
                    </Popover>
                  </div>
                  <p className="text-sm">{t.brandedContentDescription}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 text-xs md:text-sm">
          <p>
            {t.agreeToPolicy}{" "}
            {isBrandedContentChecked ? (
              <>
                <a
                  href="https://www.tiktok.com/legal/page/global/bc-policy/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  {t.brandedContentPolicy}
                </a>{" "}
                and{" "}
              </>
            ) : null}
            <a
              href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {t.musicUsagePolicy}
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
};

export default TikTokCompliance;
