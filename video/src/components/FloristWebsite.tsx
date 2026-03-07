import React from "react";
import { fonts } from "../lib/fonts";

const palette = {
  cream: "#FFF8F0",
  sage: "#7A9E7E",
  blush: "#F4C2C2",
  brown: "#8B7355",
  lavender: "#C4A8D9",
  brownLight: "#A89070",
  creamDark: "#F5EDE3",
} as const;

type FlowerCard = {
  readonly color: string;
  readonly name: string;
  readonly price: string;
};

const flowers: readonly FlowerCard[] = [
  { color: palette.sage, name: "Spring Bouquet", price: "£24.99" },
  { color: palette.blush, name: "Rose Garden", price: "£34.99" },
  { color: palette.lavender, name: "Wildflower Mix", price: "£19.99" },
] as const;

type FloristWebsiteProps = {
  readonly showCheckout?: boolean;
};

const navLinks = ["Home", "Shop", "About", "Contact"] as const;

export const FloristWebsite: React.FC<FloristWebsiteProps> = ({
  showCheckout = true,
}) => {
  const container: React.CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: palette.cream,
    display: "flex",
    flexDirection: "column",
    fontFamily: fonts.body,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  };

  const nav: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 36px",
    borderBottom: `1px solid ${palette.creamDark}`,
    backgroundColor: "rgba(255,255,255,0.6)",
  };

  const logo: React.CSSProperties = {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: palette.brown,
    letterSpacing: 0.5,
  };

  const navLinkList: React.CSSProperties = {
    display: "flex",
    gap: 28,
    listStyle: "none",
    margin: 0,
    padding: 0,
  };

  const navLinkStyle: React.CSSProperties = {
    fontSize: 15,
    color: palette.brownLight,
    fontWeight: 500,
    cursor: "pointer",
  };

  const gridContainer: React.CSSProperties = {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    padding: "32px 36px",
  };

  const cardStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  };

  const flowerImageStyle = (color: string): React.CSSProperties => ({
    width: 110,
    height: 130,
    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
    backgroundColor: color,
    opacity: 0.85,
  });

  const cardName: React.CSSProperties = {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: palette.brown,
    textAlign: "center",
  };

  const cardPrice: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: palette.sage,
  };

  const checkoutBar: React.CSSProperties = {
    padding: "18px 36px",
    display: "flex",
    justifyContent: "center",
    borderTop: `1px solid ${palette.creamDark}`,
    backgroundColor: "rgba(255,255,255,0.5)",
  };

  const checkoutButton: React.CSSProperties = {
    backgroundColor: palette.sage,
    color: "#FFFFFF",
    border: "none",
    borderRadius: 10,
    padding: "14px 48px",
    fontSize: 17,
    fontWeight: 600,
    fontFamily: fonts.body,
    cursor: "pointer",
    letterSpacing: 0.3,
  };

  return (
    <div style={container}>
      {/* Navigation */}
      <nav style={nav}>
        <div style={logo}>Bloom &amp; Petal</div>
        <ul style={navLinkList}>
          {navLinks.map((link) => (
            <li key={link} style={navLinkStyle}>
              {link}
            </li>
          ))}
        </ul>
      </nav>

      {/* Product Grid */}
      <div style={gridContainer}>
        {flowers.map((flower) => (
          <div key={flower.name} style={cardStyle}>
            <div style={flowerImageStyle(flower.color)} />
            <div style={cardName}>{flower.name}</div>
            <div style={cardPrice}>{flower.price}</div>
          </div>
        ))}
      </div>

      {/* Checkout — intentionally missing aria-label */}
      {showCheckout && (
        <div style={checkoutBar}>
          <button style={checkoutButton}>
            Checkout (2 items — £59.98)
          </button>
        </div>
      )}
    </div>
  );
};
