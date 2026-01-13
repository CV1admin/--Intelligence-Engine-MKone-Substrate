
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Props {
  memory: number[][];
  state: string;
}

const TensorMemoryVisualizer: React.FC<Props> = ({ memory, state }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || memory.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 150;
    const margin = { top: 10, right: 10, bottom: 20, left: 40 };
    
    const rows = memory[0].length; // 5 dimensions
    const cols = memory.length;    // temporal depth
    
    const cellWidth = (width - margin.left - margin.right) / cols;
    const cellHeight = (height - margin.top - margin.bottom) / rows;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Color scales based on state
    const colorScale = state === 'TRANSCENDENTAL' 
      ? d3.interpolateMagma 
      : state === 'DREAMING' 
        ? d3.interpolateCool 
        : d3.interpolateViridis;

    memory.forEach((column, x) => {
      column.forEach((value, y) => {
        g.append("rect")
          .attr("x", x * cellWidth)
          .attr("y", y * cellHeight)
          .attr("width", cellWidth - 1)
          .attr("height", cellHeight - 1)
          .attr("fill", colorScale(value))
          .attr("rx", 1)
          .attr("opacity", 0.8)
          .style("filter", value > 0.8 ? "drop-shadow(0 0 2px white)" : "none");
      });
    });

    // Axis labels
    const yLabels = ["q0", "q1", "q2", "q3", "q4"];
    g.selectAll(".label")
      .data(yLabels)
      .enter()
      .append("text")
      .attr("x", -5)
      .attr("y", (_, i) => i * cellHeight + cellHeight / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("fill", "#64748b")
      .attr("font-family", "JetBrains Mono")
      .attr("font-size", "8px")
      .text(d => d);

    g.append("text")
      .attr("x", 0)
      .attr("y", height - margin.top)
      .attr("fill", "#475569")
      .attr("font-family", "JetBrains Mono")
      .attr("font-size", "8px")
      .text("TEMPORAL_DEPTH →");

  }, [memory, state]);

  return (
    <div className="w-full h-full min-h-[150px] bg-slate-900/30 rounded border border-slate-800/50 p-2">
      <svg
        ref={svgRef}
        viewBox="0 0 600 150"
        className="w-full h-full"
      />
    </div>
  );
};

export default TensorMemoryVisualizer;
