
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Props {
  valence: number; // -1 to 1
  arousal: number; // -1 to 1
}

const EmotionCompass: React.FC<Props> = ({ valence, arousal }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const size = 200;
    const center = size / 2;
    const radius = size * 0.4;

    const g = svg.append("g");

    // Background Grid
    g.append("circle")
      .attr("cx", center)
      .attr("cy", center)
      .attr("r", radius)
      .attr("fill", "#0f172a")
      .attr("stroke", "#334155")
      .attr("stroke-width", 1);

    // Crosshairs
    g.append("line")
      .attr("x1", center - radius)
      .attr("y1", center)
      .attr("x2", center + radius)
      .attr("y2", center)
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 1);

    g.append("line")
      .attr("x1", center)
      .attr("y1", center - radius)
      .attr("x2", center)
      .attr("y2", center + radius)
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 1);

    // Labels
    const labelStyle = { fontSize: '8px', fill: '#64748b', fontFamily: 'JetBrains Mono' };
    g.append("text").attr("x", center + radius + 5).attr("y", center + 3).text("VAL+").style("font-size", "8px").attr("fill", "#64748b");
    g.append("text").attr("x", center - radius - 25).attr("y", center + 3).text("VAL-").style("font-size", "8px").attr("fill", "#64748b");
    g.append("text").attr("x", center - 10).attr("y", center - radius - 5).text("ARO+").style("font-size", "8px").attr("fill", "#64748b");
    g.append("text").attr("x", center - 10).attr("y", center + radius + 12).text("ARO-").style("font-size", "8px").attr("fill", "#64748b");

    // Dynamic Pointer
    const targetX = center + (valence * radius);
    const targetY = center - (arousal * radius); // Flip Y for visual consistency

    // Gradient for the glow
    const defs = svg.append("defs");
    const radialGradient = defs.append("radialGradient")
      .attr("id", "pointer-glow");
    radialGradient.append("stop").attr("offset", "0%").attr("stop-color", "#38bdf8");
    radialGradient.append("stop").attr("offset", "100%").attr("stop-color", "transparent");

    g.append("circle")
      .attr("cx", targetX)
      .attr("cy", targetY)
      .attr("r", 15)
      .attr("fill", "url(#pointer-glow)")
      .attr("opacity", 0.6);

    g.append("circle")
      .attr("cx", targetX)
      .attr("cy", targetY)
      .attr("r", 4)
      .attr("fill", "#38bdf8")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("filter", "drop-shadow(0 0 5px #38bdf8)");

    // Connection line from center
    g.append("line")
      .attr("x1", center)
      .attr("y1", center)
      .attr("x2", targetX)
      .attr("y2", targetY)
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 1)
      .attr("opacity", 0.3)
      .attr("stroke-dasharray", "2,2");

  }, [valence, arousal]);

  return (
    <div className="flex flex-col items-center justify-center bg-slate-900/40 rounded-lg p-2 border border-slate-800/50">
      <svg ref={svgRef} width="200" height="200" viewBox="0 0 200 200" className="w-full h-full max-w-[180px]" />
    </div>
  );
};

export default EmotionCompass;
