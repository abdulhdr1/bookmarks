import { CalendarIcon, LayoutIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

export const ShowMonthsButton = ({
  showMonths,
  handleShowMonths,
}: {
  showMonths: boolean;
  handleShowMonths: () => void;
}) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileTap={{
        scale: 0.95,
      }}
      onClick={() => void handleShowMonths()}
      className="rounded-full bg-black/10 p-3 text-black no-underline transition hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
    >
      {showMonths ? (
        <motion.div
          key="showMonths"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <LayoutIcon className="h-4 w-4 rotate-90 text-black dark:text-white" />
        </motion.div>
      ) : (
        <motion.div
          key="notShowMonths"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <CalendarIcon className="h-4 w-4 text-black dark:text-white" />
        </motion.div>
      )}
    </motion.button>
  );
};
