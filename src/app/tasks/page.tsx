"use client";

import { motion } from "framer-motion";

export default function TasksPage() {
    return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
          All Tasks
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-elevated rounded-3xl p-6 sm:p-8 mb-8"
      >

      </motion.div>
    </div>
  );
}