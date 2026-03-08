import React from "react";
import { useCurrentFrame, useVideoConfig, Img, staticFile } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  imageSrc?: string;
  delay?: number;
  tags?: string[];
}

export const TeamMember: React.FC<TeamMemberProps> = ({
  name, role, bio, imageSrc, delay = 0, tags = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = fadeInUp(frame, fps, delay);

  return (
    <div style={{ display: "flex", gap: 24, padding: 28, background: colors.bg.card, borderRadius: 12, ...anim }}>
      {imageSrc ? (
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: 100, height: 100, borderRadius: "50%", objectFit: "cover",
            border: `2px solid ${colors.accent}40`, flexShrink: 0,
          }}
        />
      ) : (
        <div style={{
          width: 100, height: 100, borderRadius: "50%", flexShrink: 0,
          background: `linear-gradient(135deg, ${colors.accentDim}, ${colors.accent})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, fontWeight: 700, color: "white",
        }}>
          {name.charAt(0)}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 24, fontWeight: 700, color: colors.text.primary, fontFamily: fonts.body, marginBottom: 4 }}>{name}</h4>
        <div style={{ fontSize: 18, color: colors.accent, marginBottom: 10, fontFamily: fonts.body }}>{role}</div>
        <p style={{ fontSize: 17, lineHeight: 1.5, color: colors.text.secondary, fontFamily: fonts.body }}>{bio}</p>
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" as const }}>
            {tags.map((tag, i) => (
              <span key={i} style={{
                background: `${colors.accent}20`, color: colors.accent,
                padding: "4px 12px", borderRadius: 16, fontSize: 15, fontFamily: fonts.mono,
              }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
