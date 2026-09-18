/**
 * BRAND IMAGE: used in Sidebar and DashboardHero.
 * brand comes from the tenant configuration, never a hardcoded bank name here.
 * compact selects the small logo; surface selects a logo suitable for a light/dark background.
 * decorative removes alternative text only where the image adds no information.
 * ...props forwards normal image attributes, such as className, to the HTML img element.
 */
export default function BrandLogo({
  brand,
  compact = false,
  surface = "dark",
  decorative = false,
  ...props
}) {
  return (
    <img
      {...props}
      src={compact ? brand.logos.compact : brand.logos[surface]}
      alt={decorative ? "" : brand.bankName}
    />
  );
}
