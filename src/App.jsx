import React, { useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";
import * as Plotly from "plotly.js-dist-min";

const DrillSenseDashboard = () => {
  const plot3dRef = useRef(null);

  // Sample data for charts
  const gnssData = [
    { x: 0, y: 0 },
    { x: 50, y: -2 },
    { x: 100, y: -1 },
    { x: 150, y: 1 },
    { x: 200, y: -1 },
  ];

  const vibrationData = [
    { freq: "0-10", value: 0.5 },
    { freq: "10-20", value: 1.0 },
    { freq: "20-30", value: 1.2 },
    { freq: "30-40", value: 1.8 },
    { freq: "40-50", value: 1.6 },
  ];

  const vibrationTimeData = [
    { x: 0, y: 0.5 },
    { x: 10, y: 3 },
    { x: 20, y: 1 },
    { x: 30, y: 6.5 },
    { x: 40, y: 1 },
    { x: 50, y: 2 },
  ];

  // 3D drill path data - max depth 15m, current depth 7m
  const drillPath = {
    planned: {
      x: [0, 0, 0, 0, 0, 0, 0, 0], // stays constant → vertical line
      y: [0, 0, 0, 0, 0, 0, 0, 0],
      z: [0, -1, -2, -3, -4, -5, -6, -7], // depth increasing
    },
    actual: {
      x: [0, -0.1, -0.1, -0.1, -0.3, -0.35, -0.4, -0.5], // tiny lateral shift
      y: [0, 0.05, 0.08, 0.1, 0.12, 0.15, 0.18, 0.2], // very small drift
      z: [0, -1.05, -2.0, -3.0, -4.05, -5.05, -6.0, -7.0], // almost same depth
    },
  };

  // Calculate which points are beyond threshold (>15cm lateral deviation)

  useEffect(() => {
    if (plot3dRef.current) {
      // Calculate which segments are beyond threshold
      const getSegmentColors = () => {
        const colors = [];
        const thresholdCm = 15; // 15cm threshold

        for (let i = 0; i < drillPath.actual.x.length; i++) {
          const plannedX = drillPath.planned.x[i];
          const actualX = drillPath.actual.x[i];
          const plannedY = drillPath.planned.y[i];
          const actualY = drillPath.actual.y[i];

          // Calculate lateral deviation in cm
          const lateralDeviation = Math.sqrt(
            Math.pow((actualX - plannedX) * 100, 2) +
              Math.pow((actualY - plannedY) * 100, 2)
          );

          colors.push(lateralDeviation > thresholdCm ? "#EF4444" : "#EAB308");
        }

        return colors;
      };

      const segmentColors = getSegmentColors();

      const trace1 = {
        x: drillPath.planned.x,
        y: drillPath.planned.y,
        z: drillPath.planned.z,
        mode: "lines+markers",
        type: "scatter3d",
        name: "Planned Path",
        line: { color: "#10B981", width: 6 },
        marker: { size: 5, color: "#10B981" },
      };

      // Create one continuous actual path with varying colors
      const trace2 = {
        x: drillPath.actual.x,
        y: drillPath.actual.y,
        z: drillPath.actual.z,
        mode: "lines+markers",
        type: "scatter3d",
        name: "Actual Path",
        line: {
          color: segmentColors,
          width: 6,
          colorscale: [
            [0, "#EAB308"], // Yellow for within threshold
            [1, "#EF4444"], // Red for beyond threshold
          ],
          showscale: false,
        },
        marker: {
          size: 6,
          color: segmentColors,
          colorscale: [
            [0, "#EAB308"],
            [1, "#EF4444"],
          ],
          showscale: false,
        },
      };

      // Add legend traces (invisible lines just for legend)
      const trace3 = {
        x: [null],
        y: [null],
        z: [null],
        mode: "lines",
        type: "scatter3d",
        name: "Within Threshold",
        line: { color: "#EAB308", width: 6 },
        // showlegend: true
      };

      const trace4 = {
        x: [null],
        y: [null],
        z: [null],
        mode: "lines",
        type: "scatter3d",
        name: "Beyond Threshold",
        line: { color: "#EF4444", width: 6 },
        // showlegend: true
      };

      const layout = {
        scene: {
          xaxis: {
            title: "X (meters)",
            titlefont: { color: "#FFFFFF" },
            tickfont: { color: "#9CA3AF" },
            range: [-8, 1],
          },
          yaxis: {
            title: "Y (meters)",
            titlefont: { color: "#FFFFFF" },
            tickfont: { color: "#9CA3AF" },
            range: [-0.5, 1],
          },
          zaxis: {
            title: "Depth (meters)",
            titlefont: { color: "#FFFFFF" },
            tickfont: { color: "#9CA3AF" },
            range: [-8, 0.5],
          },
          bgcolor: "rgba(17, 24, 39, 1)",
          camera: {
            eye: { x: 1.2, y: 1.2, z: 0.8 },
          },
        },
        paper_bgcolor: "rgba(17, 24, 39, 1)",
        plot_bgcolor: "rgba(17, 24, 39, 1)",
        font: { color: "#9CA3AF" },
        legend: {
          font: { color: "#FFFFFF", size: 12 },
          bgcolor: "rgba(31, 41, 55, 0.9)",
          bordercolor: "#4B5563",
          borderwidth: 1,
          x: 0.02,
          y: 0.98,
        },
        margin: { l: 0, r: 0, t: 0, b: 0 },
      };

      Plotly.newPlot(plot3dRef.current, [trace1, trace2,trace3,trace4], layout, {
        displayModeBar: false,
        responsive: true,
      });
    }
  }, []);

  const pathData = [
    { x: 0, y: 0, z: 0 },
    { x: -2, y: 1, z: -100 },
    { x: -4, y: 2, z: -200 },
    { x: -6, y: 2.5, z: -300 },
    { x: -8, y: 3, z: -400 },
    { x: -10, y: 3.2, z: -500 },
  ];

  return (
    <div className="min-h-fit bg-gray-900 text-white">
      <div className="w-full max-w-full">
        {/* Header */}
        {/* <div className="bg-gray-800 border-b border-gray-700 py-4 px-8">
          <h1 className="text-4xl font-bold text-white text-center">
            DrillSense
          </h1>
        </div> */}

        {/* Main Dashboard - Full Width Grid */}
        <div className="p-4 grid grid-cols-12 gap-6 max-h-screen">
          {/* Top Row - 4 main widgets */}

          {/* Deviation from Planned Path - Larger */}
          <div className="col-span-3 bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-semibold mb-6 text-center">
              Deviation from Planned Path
            </h3>
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                {/* Concentric circles representing deviation zones */}
                <div className="absolute inset-0 rounded-full border-8 border-red-500 opacity-40"></div>
                <div className="absolute inset-8 rounded-full border-8 border-yellow-500 opacity-50"></div>
                <div className="absolute inset-16 rounded-full border-8 border-green-500 opacity-60"></div>
                <div className="absolute inset-24 rounded-full bg-blue-600 shadow-lg"></div>

                {/* Legend */}
                <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 space-y-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="text-lg">&lt;3°</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                    <span className="text-lg">3° - 5°</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                    <span className="text-lg">&gt;5°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hole Quality */}
          {/* <div className="col-span-3 bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-semibold mb-6">Hole Quality</h3>
            <p className="text-gray-400 mb-4 text-lg">GNSS Deviation</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gnssData}>
                  <XAxis dataKey="x" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#9CA3AF' }} />
                  <Line type="monotone" dataKey="y" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-gray-400 mt-4 text-center">0 → 200m</div>
          </div> */}

          {/* Hole Depth - Larger display */}
          <div className="col-span-3 bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors flex flex-col justify-center">
            <h3 className="text-xl font-semibold mb-6 text-center">
              Hole Depth
            </h3>
            <div className="text-center">
              <div className="text-8xl font-bold text-white mb-4 font-mono">
                15
              </div>
              <div className="text-2xl text-gray-400">meters</div>
            </div>
          </div>
          <div className="col-span-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-6">
              Trajectory & Position Parameters
            </h3>
            <div className="grid grid-cols-4 gap-8">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="text-gray-400 mb-1">Inclination</div>
                <div className="text-white font-bold text-2xl">5°</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 relative">
                <div className="text-gray-400 mb-1">Azimuth</div>
                <div className="text-white font-bold text-2xl">25°</div>
                <div className="mt-2 bg-green-900/30 border border-green-600 rounded px-2 ">
                  <div className="text-green-400 text-xs font-medium">
                    Recommended
                  </div>
                  <div className="text-green-300 text-sm">
                    Reduce azimuth by 5°
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="text-gray-400 mb-1">Toolface orientation</div>
                <div className="text-white font-bold text-2xl">5°</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="text-gray-400 mb-1">Hole Depth</div>
                <div className="text-white font-bold text-2xl">8m</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="text-gray-400 mb-1">
                  True vertical depth (TVD)
                </div>
                <div className="text-white font-bold text-2xl">11m</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="text-gray-400 mb-1">Lateral deviation</div>
                <div className="text-white font-bold text-2xl">12cm</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="text-gray-400 mb-1">Angular deviation</div>
                <div className="text-white font-bold text-2xl">3.1°</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="text-gray-400 mb-1">Dogleg severity</div>
                <div className="text-white font-bold text-2xl">2.1°/30m</div>
              </div>
            </div>
          </div>
          {/* Vibration */}
          {/* <div className="col-span-3 bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-semibold mb-6">Vibration</h3>
            <p className="text-gray-400 mb-4 text-lg">RMS Vibration</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vibrationData} barCategoryGap="20%">
                  <XAxis dataKey="freq" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#9CA3AF' }} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div> */}

          {/* 3D Path - Larger section */}
          <div className="col-span-6 bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-semibold mb-6">3D Path</h3>
            <div className="grid grid-cols-3 gap-6 h-80">
              <div className="col-span-2 bg-gray-900 rounded-lg border border-gray-600 relative overflow-hidden">
                <div
                  ref={plot3dRef}
                  className="absolute inset-0 w-full h-full"
                ></div>
              </div>

              <div className="space-y-3 overflow-hidden">
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
                  <h4 className="text-gray-400 mb-2 text-sm">
                    Lateral Deviation
                  </h4>
                  <div className="text-2xl font-bold mb-2">12 cm</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-1/3 shadow-lg"></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Target: &lt;15cm
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
                  <h4 className="text-gray-400 mb-2 text-sm">
                    Angular Deviation
                  </h4>
                  <div className="text-2xl font-bold mb-2">3.1°</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full w-1/4 shadow-lg"></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Target: &lt;2°
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Panel */}
          <div className="col-span-6 grid grid-cols-2 gap-4">
            {/* Depth & Encoder */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <h4 className="text-lg font-semibold mb-4">Depth & Encoder</h4>
              <div className="text-4xl font-bold mb-2 font-mono">12m</div>
              <div className="text-gray-400 mb-2">Depth Confidence</div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <div className="text-green-500 font-semibold text-xl">OK</div>
              </div>
            </div>

            {/* Vibration Time Series */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <h4 className="text-lg font-semibold mb-4">Vibration</h4>
              <div className="text-gray-400 mb-2">0-10 Hz</div>
              <div className="h-30">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vibrationTimeData}>
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="#EAB308"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* <div className="text-gray-400 text-sm">0    10.0    20    30    40    50</div> */}
            </div>

            {/* Event Log - Combined larger panel */}
            <div className="col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <h4 className="text-lg font-semibold mb-4">Event Log</h4>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 mt-1"></div>
                    <div>
                      <div className="text-white font-medium">
                        Hole deviation
                      </div>
                      <div className="text-gray-400">12m depth</div>
                      <div className="text-xs text-gray-500">14:45</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 mt-1"></div>
                    <div>
                      <div className="text-white font-medium">wobble</div>
                      <div className="text-gray-400">14m depth</div>
                      <div className="text-xs text-gray-500">14:38</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 mt-1"></div>
                    <div>
                      <div className="text-white font-medium">
                        Partial collapse likely
                      </div>
                      <div className="text-gray-400">14m depth</div>
                      <div className="text-xs text-gray-500">14:33</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 mt-1"></div>
                    <div>
                      <div className="text-white font-medium">
                        Likelihood of toe formation
                      </div>
                      <div className="text-gray-400">Current position</div>
                      <div className="text-xs text-gray-500">14:56</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trajectory & Position Table - Full width bottom */}
        </div>
      </div>
    </div>
  );
};

export default DrillSenseDashboard;
