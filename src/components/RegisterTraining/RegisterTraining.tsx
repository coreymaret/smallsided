import { useState, useEffect } from "react";
import styles from "./RegisterTraining.module.scss";

interface RegisterTrainingProps {
  onClose: () => void;
  preSelectedType?: string; // 👈 allow optional pre-selected program
}

const RegisterTraining = ({ onClose, preSelectedType }: RegisterTrainingProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    playerName: "",
    parentName: "",
    email: "",
    phone: "",
    program: "Starter",
  });

  // 🎯 Auto-select program when modal opens
  useEffect(() => {
    if (preSelectedType) {
      setFormData((prev) => ({ ...prev, program: preSelectedType }));
    }
  }, [preSelectedType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Replace with real API call later
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Registration submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerWrapper}>
      <h2 className={styles.title}>Training Registration</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Player Name</label>
          <input
            type="text"
            name="playerName"
            value={formData.playerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Parent/Guardian Name</label>
          <input
            type="text"
            name="parentName"
            value={formData.parentName}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Program</label>
          <select
            name="program"
            value={formData.program}
            onChange={handleChange}
          >
            <option value="Starter">Starter</option>
            <option value="Elite">Elite</option>
            <option value="Academy">Academy</option>
          </select>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelBtn}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Complete Registration"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterTraining;