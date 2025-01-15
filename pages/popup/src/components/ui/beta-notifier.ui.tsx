export const BetaNotifier = () => {
  return (
    <div className="mt-4 text-center text-[10px] font-normal text-slate-600">
      In beta.{' '}
      <a
        href="https://app.discord.com/settings?utm_source=extension"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-slate-900">
        Report bugs or request features.
      </a>
    </div>
  );
};
