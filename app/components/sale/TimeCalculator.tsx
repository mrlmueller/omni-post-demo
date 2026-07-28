"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Import your shadcn/ui components instead of @nextui-org
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface TimeCalculatorProps {
  t: {
    hoursPerMonth: string;
    wasted: string;
    withThisTime: string;
    adjustmentButtonShow: string;
    adjustmentButtonHide: string;
    videosPerMonth: string;
    platformsTitle: string;
    startSaving: string;
    examplesByTime: {
      short: string[];
      medium: string[];
      long: string[];
    };
  };
}

const platforms = [
  { name: "Instagram", timePerUpload: 6 },
  { name: "TikTok", timePerUpload: 8 },
  { name: "YouTube", timePerUpload: 6 },
  { name: "Facebook", timePerUpload: 6 },
  { name: "X", timePerUpload: 6 },
];

export default function TimeCalculator({ t }: TimeCalculatorProps) {
  const [videosPerMonth, setVideosPerMonth] = useState(20);
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    platforms.slice(0, 3).map((p) => p.name)
  );
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [currentExample, setCurrentExample] = useState(0);
  const [fadeEffect, setFadeEffect] = useState(true);

  const router = useRouter();

  const calculateWastedTime = () => {
    const totalTime = selectedPlatforms.reduce((acc, platformName) => {
      const platformData = platforms.find((p) => p.name === platformName);
      return acc + (platformData ? platformData.timePerUpload : 0);
    }, 0);
    // Convert minutes to hours
    return (totalTime * videosPerMonth) / 60;
  };

  const wastedTime = calculateWastedTime();

  const getExamples = () => {
    if (wastedTime <= 8) return t.examplesByTime.short;
    if (wastedTime <= 12) return t.examplesByTime.medium;
    return t.examplesByTime.long;
  };

  const examples = getExamples();

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeEffect(false);
      setTimeout(() => {
        setCurrentExample((prev) => (prev + 1) % examples.length);
        setFadeEffect(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [examples]);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Time Display */}
      <div className="text-center ">
        <div className="text-4xl sm:text-6xl font-bold text-blue-500">
          {t.hoursPerMonth.replace("{value}", wastedTime.toFixed(1))}
        </div>
        <div className="text-2xl text-roseTaupe dark:text-gray-300 mt-2 ">
          {t.wasted}
        </div>
      </div>
      <p className="text-lg text-center max-w-xl font-small">
        {t.withThisTime}{" "}
        <span
          className={`transition-opacity duration-250 ease-in-out font-bold ${
            fadeEffect ? "opacity-100" : "opacity-0"
          }`}
        >
          {examples[currentExample]}
        </span>
      </p>

      {/* Show/Hide Adjustment Button */}
      <Button
        onClick={() => setShowAdjustment(!showAdjustment)}
        className="bg-transparent hover:bg-gray-100 text-blue-600 px-3 py-1.5 border-blue-500 border-2 rounded"
      >
        {showAdjustment ? t.adjustmentButtonHide : t.adjustmentButtonShow}
      </Button>

      {/* Adjustments */}
      {showAdjustment && (
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between sm:space-x-7 space-y-5 sm:space-y-0">
          {/* Videos per Month */}
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold mb-2">{t.videosPerMonth}</p>
            <Input
              type="number"
              value={videosPerMonth}
              onChange={(e) => setVideosPerMonth(Number(e.target.value))}
              min={1}
              className="w-1/2 mx-auto sm:mx-0"
            />
          </div>

          {/* Divider (hidden on mobile) */}
          <div className="hidden sm:block border-r border-gray-200 dark:border-gray-700" />

          {/* Platforms */}
          <div className="space-y-2 text-center sm:text-left mt-5 sm:mt-0">
            <p className="text-sm font-semibold">{t.platformsTitle}</p>
            <div className="grid grid-cols-2 gap-2 justify-center sm:justify-start">
              {platforms.map((platform) => (
                <Checkbox
                  key={platform.name}
                  checked={selectedPlatforms.includes(platform.name)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPlatforms([
                        ...selectedPlatforms,
                        platform.name,
                      ]);
                    } else {
                      setSelectedPlatforms(
                        selectedPlatforms.filter((p) => p !== platform.name)
                      );
                    }
                  }}
                >
                  {platform.name}
                </Checkbox>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <Button
        onClick={() => router.push("/pricing")}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded"
        size="lg"
      >
        {t.startSaving}
      </Button>
    </div>
  );
}
