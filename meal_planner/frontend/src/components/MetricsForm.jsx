import { useState } from 'react';

export default function MetricsForm({ onSubmit, error }) {
  const [formData, setFormData] = useState({
    height: 170,
    weight: 65,
    age: 25,
    gender: 'male',
    goal: 'maintain',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      height: Number(formData.height),
      weight: Number(formData.weight),
      age: Number(formData.age),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="soft-card rounded-[2rem] p-6 md:p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Form</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Enter your details</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Height</p>
          <p className="mt-1 text-xs text-slate-500">In cm</p>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-rose-300"
          />
        </label>

        <label className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Weight</p>
          <p className="mt-1 text-xs text-slate-500">In kg</p>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-rose-300"
          />
        </label>

        <label className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Age</p>
          <p className="mt-1 text-xs text-slate-500">In years</p>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-rose-300"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Gender</p>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-rose-300"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Goal</p>
          <select
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-rose-300"
          >
            <option value="weight_loss">Lose weight</option>
            <option value="maintain">Maintain</option>
            <option value="weight_gain">Gain weight</option>
          </select>
        </label>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="button-primary w-full"
        >
          Create plan
        </button>
        <button
          type="button"
          onClick={() =>
            setFormData({
              height: 170,
              weight: 65,
              age: 25,
              gender: 'male',
              goal: 'maintain',
            })
          }
          className="button-secondary w-full"
        >
          Reset form
        </button>
      </div>
    </form>
  );
}
