import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as invoiceApi from "../api/invoiceApi";

export const fetchReceiptThunk = createAsyncThunk(
  "invoice/fetchReceipt",
  async (invoiceId, { rejectWithValue }) => {
    try {
      return await invoiceApi.getInvoiceReceipt(invoiceId);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const printReceiptThunk = createAsyncThunk(
  "invoice/printReceipt",
  async (invoiceId, { rejectWithValue }) => {
    try {
      return await invoiceApi.printInvoiceReceipt(invoiceId);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  receipt: null,
  status: "idle",
  error: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    resetInvoiceState(state) {
      state.receipt = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Receipt
      .addCase(fetchReceiptThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchReceiptThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.receipt = action.payload;
      })
      .addCase(fetchReceiptThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Print Receipt (Updates receipt details on UI after print count changes)
      .addCase(printReceiptThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(printReceiptThunk.fulfilled, (state, action) => {
        state.receipt = action.payload;
      })
      .addCase(printReceiptThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetInvoiceState } = invoiceSlice.actions;

export default invoiceSlice.reducer;
